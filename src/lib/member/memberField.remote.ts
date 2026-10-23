import { command, form, getRequestEvent, query } from '$app/server'
import type { FieldType } from '@prisma/client'
import z from 'zod'
import { modelMemberFieldCreate, modelMemberFieldUpdate } from '#lib/models/index.js'
import { zSearchInEvent } from '#lib/models/form.js'
import { permission, prisma, uniqueIssue } from '#lib/server/index.js'

const NAME_TAKEN = 'Un champ porte déjà ce nom'

export const createMemberField = form(modelMemberFieldCreate, async (data, issue) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	const nbFields = await prisma.field.count({ where: { eventId } })
	return prisma.field
		.create({ data: { ...data, eventId, position: nbFields } })
		.catch(uniqueIssue(issue.name(NAME_TAKEN)))
})

export const updateMemberField = form(modelMemberFieldUpdate, async (data, issue) => {
	const { locals, params } = getRequestEvent()
	await permission.admin(params.eventId!, locals)
	return prisma.field
		.update({ where: { id: data.id }, data })
		.catch(uniqueIssue(issue.name(NAME_TAKEN)))
})

export const deleteMemberField = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	return prisma.field.delete({ where: { id, eventId } })
})

export const reorderMemberFields = command(z.array(z.string()), async (ids) => {
	const { locals, params } = getRequestEvent()
	await permission.admin(params.eventId!, locals)
	return prisma.$transaction(
		ids.map((id, position) => prisma.field.update({ where: { id }, data: { position } }))
	)
})

const fieldTypes = [
	'string',
	'textarea',
	'number',
	'boolean',
	'select',
	'multiselect',
] as const satisfies readonly FieldType[]

export const searchMemberFields = query(
	zSearchInEvent.extend({ types: z.array(z.enum(fieldTypes)).optional() }),
	async ({ search, eventId, types }) => {
		const { locals } = getRequestEvent()
		await permission.leader(eventId, locals)
		return prisma.field.findMany({
			where: { eventId, name: { contains: search }, ...(types && { type: { in: types } }) },
			take: 10,
		})
	}
)

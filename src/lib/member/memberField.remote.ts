import { command, form, getRequestEvent, query } from '$app/server'
import type { FieldType } from '@prisma/client'
import z from 'zod'
import { modelMemberFieldCreate, modelMemberFieldUpdate } from '$lib/models'
import { permission, prisma } from '$lib/server'

export const createMemberField = form(modelMemberFieldCreate, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	const nbFields = await prisma.field.count({ where: { eventId } })
	return prisma.field.create({ data: { ...data, eventId, position: nbFields } })
})

export const updateMemberField = form(modelMemberFieldUpdate, async (data) => {
	const { locals, params } = getRequestEvent()
	await permission.admin(params.eventId!, locals)
	return prisma.field.update({ where: { id: data.id }, data })
})

export const deleteMemberField = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	return prisma.field.delete({ where: { id, eventId } })
})

/**
 * Le glisser-déposer envoyait un `FormData` dont chaque clé était un id de champ. En `command()`
 * l'ordre voyage tel quel: la position d'un champ est son index dans le tableau.
 */
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

/** Alimente l'`InputSelect` de `InputFieldSelect`, sur la page des badges. */
export const searchMemberFields = query(
	z.object({ search: z.string(), types: z.array(z.enum(fieldTypes)).optional() }),
	async ({ search, types }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.leader(eventId, locals)
		return prisma.field.findMany({
			where: { eventId, name: { contains: search }, ...(types && { type: { in: types } }) },
			take: 10,
		})
	}
)

import { form, getRequestEvent, query } from '$app/server'
import z from 'zod'
import { modelTagCreate, modelTagUpdate } from '#lib/models/index.js'
import { zSearchInEvent } from '#lib/models/form.js'
import { permission, prisma, uniqueIssue } from '#lib/server/index.js'

const NAME_TAKEN = 'Une étiquette porte déjà ce nom'

export const createTag = form(modelTagCreate, async (data, issue) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.tag
		.create({ data: { ...data, eventId } })
		.catch(uniqueIssue(issue.name(NAME_TAKEN)))
})

export const updateTag = form(modelTagUpdate, async (data, issue) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.tag
		.update({ where: { id: data.id, eventId }, data })
		.catch(uniqueIssue(issue.name(NAME_TAKEN)))
})

export const deleteTag = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.tag.delete({ where: { id, eventId } })
})

/** Alimente l'`InputMultiSelect` des étiquettes de `PeriodForm`. */
export const searchTags = query(zSearchInEvent, async ({ search, eventId }) => {
	const { locals } = getRequestEvent()
	await permission.leader(eventId, locals)
	return prisma.tag.findMany({
		where: { eventId, name: { contains: search } },
		take: 10,
	})
})

import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelTagCreate, modelTagUpdate } from '$lib/models'
import { permission, prisma } from '$lib/server'

export const createTag = form(z.object(modelTagCreate), async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.tag.create({ data: { ...data, eventId } })
})

export const updateTag = form(z.object(modelTagUpdate), async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.tag.update({ where: { id: data.id, eventId }, data })
})

export const deleteTag = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.tag.delete({ where: { id, eventId } })
})

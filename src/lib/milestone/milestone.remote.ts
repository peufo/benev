import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelMilestoneCreate, modelMilestoneUpdate } from '$lib/models'
import { permission, prisma } from '$lib/server'

export const createMilestone = form(z.object(modelMilestoneCreate), async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.milestone.create({ data: { ...data, eventId } })
})

export const updateMilestone = form(z.object(modelMilestoneUpdate), async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.milestone.update({ where: { id: data.id, eventId }, data })
})

export const deleteMilestone = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.milestone.delete({ where: { id, eventId } })
})

import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelViewCreate } from '$lib/models'
import { permission, prisma } from '$lib/server'

export const createView = form(modelViewCreate, async (data) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.view.create({ data: { ...data, eventId } })
})

export const updateView = form(
	modelViewCreate.extend({ id: z.string() }),
	async ({ id, ...data }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.leader(eventId, locals)
		return prisma.view.update({ where: { id, eventId }, data: { ...data, eventId } })
	}
)

export const deleteView = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.leader(eventId, locals)
	return prisma.view.delete({ where: { id, eventId } })
})

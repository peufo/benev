import { form, getRequestEvent } from '$app/server'
import z from 'zod'
import { modelMediaImage } from '$lib/models/media'
import { media, permission, prisma } from '$lib/server'

export const uploadMedia = form(
	modelMediaImage.extend({ name: z.string() }),
	async ({ name, image, crop }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		const member = await permission.admin(eventId, locals)

		return media.upload({ image, crop }, { data: { eventId, name, createdById: member.userId } })
	}
)

export const deleteMedia = form(z.object({ id: z.string() }), async ({ id }) => {
	const { locals, params } = getRequestEvent()
	const eventId = params.eventId!
	await permission.admin(eventId, locals)
	return media.delete({ id, eventId })
})

export const editMedia = form(
	z.object({ id: z.string(), name: z.string() }),
	async ({ id, name }) => {
		const { locals, params } = getRequestEvent()
		const eventId = params.eventId!
		await permission.admin(eventId, locals)
		return prisma.media.update({ where: { id, eventId }, data: { name } })
	}
)

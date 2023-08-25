import { eventShema, memberFieldShema, memberFieldShemaUpdate } from '$lib/form'
import { isOwnerOrThrow, parseFormData, prisma, tryOrFail } from '$lib/server'
import { z } from 'zod'

export const load = async ({ params }) => ({
	memberFields: await prisma.field.findMany({
		where: {
			eventId: params.eventId,
		},
	}),
})

export const actions = {
	update_event: async ({ request, params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const { err, data } = await parseFormData(request, eventShema)
		if (err) return err

		return tryOrFail(() =>
			prisma.event.update({
				where: { id: data.id },
				data,
			})
		)
	},
	delete_event: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		return tryOrFail(
			() =>
				prisma.event.delete({
					where: { id: params.eventId },
				}),
			'/'
		)
	},
	create_field: async ({ request, params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)
		const { err, data } = await parseFormData(request, memberFieldShema)
		if (err) return err

		return tryOrFail(() =>
			prisma.field.create({
				data: {
					...data,
					eventId: params.eventId,
				},
			})
		)
	},
	delete_field: async ({ request, params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)
		const { err, data } = await parseFormData(request, z.object({ id: z.string() }))
		if (err) return err

		return tryOrFail(() =>
			prisma.field.delete({
				where: { id: data.id, eventId: params.eventId },
			})
		)
	},
	update_field: async ({ request, params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const { err, data } = await parseFormData(request, memberFieldShemaUpdate)
		if (err) return err

		return tryOrFail(() =>
			prisma.field.update({
				where: { id: data.id },
				data,
			})
		)
	},
}

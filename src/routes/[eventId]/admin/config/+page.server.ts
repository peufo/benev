import { redirect } from '@sveltejs/kit'
import { eventShema } from '$lib/form'
import { isOwnerOrThrow, parseFormData, prisma, tryOrFail } from '$lib/server'

export const actions = {
	update_event: async ({ request, params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const { err, data } = await parseFormData(request, eventShema)
		if (err) return err

		return tryOrFail(async () => {
			await prisma.event.update({
				where: { id: data.id },
				data,
			})
		})
	},
	delete_event: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		return tryOrFail(async () => {
			await prisma.event.delete({
				where: { id: params.eventId },
			})
		}, '/')
	},
}

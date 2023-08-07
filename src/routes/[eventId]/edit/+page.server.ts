import { fail, redirect } from '@sveltejs/kit'
import { eventShema, pageShema } from '$lib/form'

import { isOwnerOrThrow, parseFormData, prisma } from '$lib/server'

export const actions = {
	update_event: async ({ request, params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const { err, data } = await parseFormData(request, eventShema)
		if (err) return err

		await prisma.event.update({
			where: { id: data.id },
			data,
		})

		return
	},
	delete_event: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		await prisma.event.delete({
			where: { id: params.eventId },
		})

		throw redirect(301, '/')
	},
}

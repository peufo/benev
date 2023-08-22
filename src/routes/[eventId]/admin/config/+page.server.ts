import { redirect } from '@sveltejs/kit'
import { eventShema } from '$lib/form'

import { isOwnerOrThrow, parseFormData, prisma } from '$lib/server'
import { scrapLogo } from '$lib/server/scrapLogo'

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

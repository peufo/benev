import { ActionFailure, fail, redirect } from '@sveltejs/kit'
import { isOwnerOrThrow, prisma } from '$lib/server'

export const actions = {
	create_page: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const pageOrFail = await prisma.page
			.create({
				data: {
					eventId: params.eventId,
					title: 'Ma nouvelle page',
					content: '',
				},
			})
			.catch((err) => {
				return fail(400, { message: err.message })
			})
		if ('id' in pageOrFail) throw redirect(301, `/${params.eventId}/edit/pages/${pageOrFail.id}`)
		return pageOrFail
	},
}

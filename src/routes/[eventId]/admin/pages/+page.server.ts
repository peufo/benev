import { fail, redirect } from '@sveltejs/kit'
import { isOwnerOrThrow, prisma } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const load = async ({ parent, params }) => {
	const { pages } = await parent()
	if (pages[0]) throw redirect(301, `/${params.eventId}/admin/pages/${pages[0].id}`)
}

export const actions = {
	create_page: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const pagesCount = await prisma.page.count({ where: { eventId: params.eventId } })

		const title = `Ma page ${pagesCount + 1}`

		const pageOrFail = await prisma.page
			.create({
				data: {
					eventId: params.eventId,
					title,
					path: normalizePath(title),
					content: '',
				},
			})
			.catch((err) => {
				return fail(400, { message: err.message })
			})
		if ('id' in pageOrFail) throw redirect(301, `/${params.eventId}/admin/pages/${pageOrFail.id}`)
		return pageOrFail
	},
}

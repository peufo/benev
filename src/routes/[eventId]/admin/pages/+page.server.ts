import { redirect } from '@sveltejs/kit'
import { isOwnerOrThrow, prisma, tryOrFail } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const load = async ({ parent, params }) => {
	const { pageIndex } = await parent()
	throw redirect(301, `/${params.eventId}/admin/pages/${pageIndex.id}`)
}

export const actions = {
	create_page: async ({ params, locals }) => {
		await isOwnerOrThrow(params.eventId, locals)

		const pagesCount = await prisma.page.count({ where: { eventId: params.eventId } })

		const title = `Ma page ${pagesCount + 1}`

		return tryOrFail(
			() =>
				prisma.page.create({
					data: {
						eventId: params.eventId,
						title,
						path: normalizePath(title),
						content: '',
					},
				}),
			(page) => `/${params.eventId}/admin/pages/${page.id}`
		)
	},
}

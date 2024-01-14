import { redirect } from '@sveltejs/kit'
import { prisma, tryOrFail, permission } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const load = async ({ params: { eventId } }) => {
	const pageIndex = await prisma.page.findFirstOrThrow({ where: { eventId, isIndex: true } })
	redirect(301, `/${eventId}/admin/pages/${pageIndex.id}`);
}

export const actions = {
	create_page: async ({ locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)

		const pagesCount = await prisma.page.count({ where: { eventId: eventId } })

		const title = `Ma page ${pagesCount + 1}`

		return tryOrFail(
			() =>
				prisma.page.create({
					data: {
						eventId: eventId,
						title,
						path: normalizePath(title),
						content: '',
					},
				}),
			(page) => `/${eventId}/admin/pages/${page.id}`
		)
	},
}

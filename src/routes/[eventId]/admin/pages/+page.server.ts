import { redirect } from '@sveltejs/kit'
import { tryOrFail } from 'fuma/server'
import { prisma, permission } from '$lib/server'
import { normalizePath } from '$lib/normalizePath.js'

export const load = async ({ params: { eventId } }) => {
	const homePage = await prisma.page.findFirstOrThrow({ where: { eventId, type: 'home' } })
	redirect(301, `/${eventId}/admin/pages/${homePage.id}`)
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

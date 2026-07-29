import { redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server'

export const load = async ({ params: { pageId, eventId } }) => {
	const page = await prisma.page.findUnique({ where: { id: pageId, eventId } })
	if (!page) redirect(302, `/${eventId}/admin/pages`)

	return {
		page,
	}
}

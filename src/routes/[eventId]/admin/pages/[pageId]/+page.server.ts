import { redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server'
import { resolve } from '$app/paths'

export const load = async ({ params: { pageId, eventId } }) => {
	const page = await prisma.page.findUnique({ where: { id: pageId, eventId } })
	if (!page) redirect(302, resolve('/[eventId]/admin/pages', { eventId }))

	return {
		page,
	}
}

import { redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server'
import { resolve } from '$app/paths'

export const load = async ({ params: { eventId } }) => {
	const homePage = await prisma.page.findFirstOrThrow({ where: { eventId, type: 'home' } })
	redirect(301, resolve('/[eventId]/admin/pages/[pageId]', { eventId, pageId: homePage.id }))
}

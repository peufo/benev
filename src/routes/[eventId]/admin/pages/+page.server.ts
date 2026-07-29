import { redirect } from '@sveltejs/kit'
import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => {
	const homePage = await prisma.page.findFirstOrThrow({ where: { eventId, type: 'home' } })
	redirect(301, `/${eventId}/admin/pages/${homePage.id}`)
}

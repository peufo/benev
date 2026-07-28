import { prisma } from '$lib/server'
import { NOINDEX_FOLLOW } from '$lib/seo'

export const load = async ({ params: { eventId } }) => ({
	charter: await prisma.page.findFirst({ where: { eventId, type: 'charter' } }),
	metaTags: NOINDEX_FOLLOW,
})

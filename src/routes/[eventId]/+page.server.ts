import { prisma } from '#lib/server/index.js'

export const load = async ({ params }) => ({
	page: await prisma.page.findFirst({ where: { eventId: params.eventId, type: 'home' } }),
})

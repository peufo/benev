import { prisma } from '$lib/server'

export const load = async ({ params }) => ({
	page: await prisma.page.findFirst({ where: { eventId: params.eventId, isIndex: true } }),
})

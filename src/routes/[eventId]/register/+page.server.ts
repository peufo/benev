import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => ({
	charter: await prisma.page.findFirst({ where: { eventId, type: 'charter' } }),
})

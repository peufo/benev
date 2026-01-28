import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => ({
	emails: await prisma.page.findMany({
		where: { eventId, type: 'email' },
		orderBy: { index: 'asc' },
	}),
	badges: await prisma.badge.findMany({
		where: { eventId },
	}),
})

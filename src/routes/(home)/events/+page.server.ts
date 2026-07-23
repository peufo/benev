import { prisma } from '$lib/server'

export const load = async () => {
	const now = new Date()
	const events = await prisma.event.findMany({
		where: {
			state: 'published',
			deletedAt: null,
			OR: [
				{ endDate: { gte: now } },
				{ endDate: null, startDate: { gte: now } },
				{ endDate: null, startDate: null },
			],
		},
		orderBy: [{ startDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
	})
	return { events }
}

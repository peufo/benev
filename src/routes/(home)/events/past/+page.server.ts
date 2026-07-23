import { prisma } from '$lib/server'

export const load = async () => {
	const now = new Date()
	const events = await prisma.event.findMany({
		where: {
			state: { in: ['published', 'archived'] },
			deletedAt: null,
			OR: [{ endDate: { lt: now } }, { endDate: null, startDate: { lt: now } }],
		},
		orderBy: [{ startDate: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
	})
	return { events }
}

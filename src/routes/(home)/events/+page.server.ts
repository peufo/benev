import { prisma } from '$lib/server'

export const load = async () => {
	const events = await prisma.event.findMany({
		where: { state: 'published', deletedAt: null },
		orderBy: [{ startDate: 'desc' }, { createdAt: 'desc' }],
	})
	return { events }
}

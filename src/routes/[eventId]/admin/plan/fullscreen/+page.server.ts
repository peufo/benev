import { prisma } from '$lib/server'
import { getPlanData } from '../getPlanData'

export const load = async ({ url, params: { eventId } }) => {
	return {
		...(await getPlanData({ url, eventId })),
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	}
}

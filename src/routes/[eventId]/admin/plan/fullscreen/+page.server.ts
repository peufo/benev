import { permission, prisma } from '$lib/server'
import { getPlanData } from '../getPlanData'

export const load = async ({ locals, url, params: { eventId } }) => {
	await permission.leader(eventId, locals)

	return {
		...(await getPlanData({ url, eventId })),
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	}
}

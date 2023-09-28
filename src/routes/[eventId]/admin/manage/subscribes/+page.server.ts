import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => {
	return {
		subscribes: await prisma.subscribe.findMany({
			where: { period: { team: { eventId } } },
		}),
	}
}

import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => {
	return {
		gifts: await prisma.gift.findMany({
			where: { eventId },
			include: { conditions: true },
		}),
	}
}

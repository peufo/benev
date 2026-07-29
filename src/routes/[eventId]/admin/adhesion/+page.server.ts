import { prisma } from '$lib/server'

export const load = async ({ parent, params: { eventId } }) => {
	await parent()

	return {
		memberFields: await prisma.field.findMany({
			orderBy: { position: 'asc' },
			where: { eventId },
		}),
		gifts: await prisma.gift.findMany({
			where: { eventId },
			include: { conditions: true },
		}),
	}
}

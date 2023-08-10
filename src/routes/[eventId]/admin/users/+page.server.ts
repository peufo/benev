import { prisma } from '$lib/server'

export const load = async ({ params }) => ({
	periods: await prisma.period.findMany({
		where: { team: { eventId: params.eventId } },
	}),
	users: await prisma.user.findMany({
		where: { subscribes: { some: { period: { team: { eventId: params.eventId } } } } },
		include: {
			subscribes: true,
		},
	}),
})

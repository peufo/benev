import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => ({
	users: await prisma.user.findMany({
		where: {
			leadersOf: { some: { team: { eventId } } },
		},
		include: {
			leadersOf: {
				where: { team: { eventId } },
				include: { team: true },
			},
		},
	}),
})

import { prisma } from '$lib/server'

export const load = async ({ params: { eventId } }) => ({
	users: await prisma.user.findMany({
		where: {
			leaders: { some: { team: { eventId } } },
		},
		include: {
			leaders: { where: { team: { eventId } } },
		},
	}),
})

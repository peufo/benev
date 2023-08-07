import { prisma } from '$lib/server'

export const load = async () => ({
	subscribe: await prisma.subscribe.findFirstOrThrow({
		include: {
			user: true,
			period: { include: { team: { include: { event: true } } } },
		},
	}),
})

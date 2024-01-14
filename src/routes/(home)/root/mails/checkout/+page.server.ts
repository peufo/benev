import { prisma } from '$lib/server'

export const load = async () => ({
	checkout: await prisma.checkout.findFirst({
		include: {
			user: true,
			licences: true,
		},
	}),
})

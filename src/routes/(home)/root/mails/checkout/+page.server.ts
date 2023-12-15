import { prisma } from '$lib/server'

export const load = async () => ({
	checkout: prisma.checkout.findFirst({
		include: {
			user: true,
			licences: true,
		},
	}),
})

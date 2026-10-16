import { prisma } from '#lib/server/index.js'

export const load = async () => ({
	checkout: await prisma.checkout.findFirst({
		include: {
			user: true,
			products: true,
		},
	}),
})

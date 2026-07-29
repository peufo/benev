import { getUserOrRedirect, prisma } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)

	const checkouts = await prisma.checkout.findMany({
		where: { userId: user.id },
		include: {
			products: {
				include: { event: { select: { id: true, name: true, deletedAt: true } } },
			},
		},
		orderBy: {
			createdAt: 'desc',
		},
	})

	return { checkouts }
}

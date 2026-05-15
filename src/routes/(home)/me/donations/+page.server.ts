import { getUserOrRedirect, prisma } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)

	return {
		checkouts: await prisma.checkout.findMany({
			where: { userId: user.id },
			orderBy: {
				createdAt: 'desc',
			},
		}),
		licences: await prisma.licence.groupBy({
			where: { checkout: { userId: user.id } },
			by: ['checkoutId', 'type'],
			_count: { _all: true },
		}),
	}
}

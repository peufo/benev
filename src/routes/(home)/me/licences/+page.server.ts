import { getUserOrRedirect, prisma } from '$lib/server'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)

	return {
		checkouts: await prisma.checkout.findMany({
			where: { userId: user.id },
			include: { licences: true },
			orderBy: {
				createdAt: 'desc',
			},
		}),
		licencesCount: await prisma.licence.groupBy({
			by: 'type',
			where: { ownerId: user.id },
			_sum: {
				quantity: true,
			},
		}),
		eventsCount: await prisma.event.count({
			where: { ownerId: user.id, activedAt: { not: null } },
		}),
	}
}

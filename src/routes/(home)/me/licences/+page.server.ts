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
		events: await prisma.event.findMany({
			where: { ownerId: user.id, licence: { isNot: null } },
			select: {
				id: true,
				name: true,
				updatedAt: true,
				_count: {
					select: {
						members: { where: { licence: { isNot: null } } },
					},
				},
			},
		}),
	}
}

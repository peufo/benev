import { getUserOrRedirect, prisma } from '$lib/server'
import { LicenceType } from '@prisma/client'

export const load = async ({ url, locals }) => {
	const user = await getUserOrRedirect(url, locals)

	const licencesCount = await prisma.licence.groupBy({
		by: 'type',
		where: { ownerId: user.id },
		_sum: {
			quantity: true,
		},
	})
	const licences: Partial<Record<LicenceType, number>> = licencesCount.reduce(
		(acc, cur) => ({ ...acc, [cur.type]: cur._sum.quantity }),
		{}
	)

	return {
		checkouts: await prisma.checkout.findMany({
			where: { userId: user.id },
			include: { licences: true },
			orderBy: {
				createdAt: 'desc',
			},
		}),
		licences,
	}
}

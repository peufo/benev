import { prisma, isTierQuotaReached } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'

export const load = async ({ parent, url, params: { eventId } }) => {
	const { member, userIsRoot, event } = await parent()
	if (!member?.roles.includes('leader') && !userIsRoot) error(403)

	if (!userIsRoot && url.pathname !== `/${eventId}/admin/quota`) {
		const quotaReached = await isTierQuotaReached(event)
		if (quotaReached) redirect(302, `/${eventId}/admin/quota`)
	}

	return {
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	}
}

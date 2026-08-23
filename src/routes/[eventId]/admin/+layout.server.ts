import { prisma, isTierQuotaReached } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'
import { NOINDEX } from '$lib/seo'
import { resolve } from '$app/paths'

export const load = async ({ parent, route, params: { eventId } }) => {
	const { member, userIsRoot, event } = await parent()
	if (!member?.roles.includes('leader') && !userIsRoot) error(403)

	if (!userIsRoot && route.id !== '/[eventId]/admin/quota') {
		const quotaReached = await isTierQuotaReached(event)
		if (quotaReached) redirect(302, resolve('/[eventId]/admin/quota', { eventId }))
	}

	return {
		metaTags: NOINDEX,
		teams: await prisma.team.findMany({
			where: { eventId },
			select: { id: true, name: true },
			orderBy: { name: 'asc' },
		}),
	}
}

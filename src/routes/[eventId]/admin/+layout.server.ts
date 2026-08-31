import { prisma, isTierQuotaReached, redirectToRegister } from '$lib/server'
import { error, redirect } from '@sveltejs/kit'
import { NOINDEX } from '$lib/seo'
import { resolve } from '$app/paths'

export const load = async ({ parent, route, url, params: { eventId } }) => {
	const { member, memberToClaim, userIsRoot, event } = await parent()
	// Invité comme responsable, mais la fiche n'est pas encore reliée au compte: les rôles qu'elle
	// porte ne valent rien tant que l'adhésion n'est pas faite. Un 403 sec ne dirait pas quoi faire.
	if (!member && memberToClaim && !userIsRoot) throw redirectToRegister(eventId, url)
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

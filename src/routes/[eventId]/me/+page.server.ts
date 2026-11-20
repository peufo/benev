import { prisma, redirectToAuth, redirectToRegister } from '#lib/server/index.js'
import { memberIsRegistered } from '#lib/member/index.js'
import { canAccessEvent } from '#lib/event/eventAccess.js'

export const load = async ({ url, parent, params: { eventId } }) => {
	const { member, user, event, userIsRoot } = await parent()
	if (!user) throw redirectToAuth(url)
	if (!memberIsRegistered(member)) throw redirectToRegister(eventId, url)
	// Le layout n'affiche que l'annonce d'un évènement fermé: secteurs et responsables restent ici.
	if (!canAccessEvent(event, member, userIsRoot)) return { member, memberTeams: [] }

	const memberId = member.id
	return {
		member,
		memberTeams: await prisma.team.findMany({
			// Un secteur en brouillon ne prépare encore rien que le membre doive voir.
			where: { state: { not: 'draft' }, periods: { some: { subscribes: { some: { memberId } } } } },
			include: {
				leaders: true,
				periods: {
					where: { subscribes: { some: { memberId } } },
					orderBy: { start: 'asc' },
					include: {
						tags: true,
						subscribes: {
							where: { memberId },
							include: {
								member: {
									select: {
										userId: true,
									},
								},
							},
						},
					},
				},
			},
		}),
	}
}

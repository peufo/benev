import { eventLogsWhere, getLogs, getMemberProfile, prisma } from '$lib/server'

export const load = async ({ parent, params: { memberId, eventId } }) => {
	const { member } = await parent()
	const isAdmin = !!member?.roles.includes('admin')

	return {
		// Le journal d'une personne montre ses coordonnées éditées et ses changements de rôle:
		// réservé aux admins, comme l'onglet Journal.
		journal: isAdmin
			? await getLogs(eventLogsWhere({ eventId, memberId }), { take: 30 })
			: { logs: [], hasMore: false },
		memberProfile: await getMemberProfile(
			{ id: memberId, eventId },
			member && { member, event: member.event }
		),
		event: await prisma.event.findUniqueOrThrow({
			where: { id: eventId, deletedAt: null },
			include: {
				badges: { select: { id: true, name: true } },
				memberFields: {
					orderBy: { position: 'asc' },
				},
				teams: {
					where: { periods: { some: { subscribes: { some: { memberId } } } } },
					include: {
						leaders: true,
						periods: {
							where: { subscribes: { some: { memberId } } },
							include: {
								subscribes: {
									where: { memberId },
									include: {
										member: {
											select: {
												isValidedByUser: true,
											},
										},
									},
								},
								tags: true,
							},
							orderBy: { start: 'asc' },
						},
					},
				},
			},
		}),
	}
}

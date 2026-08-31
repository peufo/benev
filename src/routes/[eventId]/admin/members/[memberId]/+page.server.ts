import { getEventJournal, getMemberProfile, prisma } from '$lib/server'

export const load = async ({ url, parent, params: { memberId, eventId } }) => {
	const { member } = await parent()

	return {
		journal: await getEventJournal({ eventId, url, memberId }),
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
												userId: true,
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

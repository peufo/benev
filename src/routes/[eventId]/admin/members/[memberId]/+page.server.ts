import { getMemberProfile, prisma } from '$lib/server'

export const load = async ({ parent, params: { memberId, eventId } }) => {
	const { member } = await parent()

	return {
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

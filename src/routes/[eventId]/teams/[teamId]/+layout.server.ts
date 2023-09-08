import { isLeader, prisma } from '$lib/server'

export const load = async ({ params, locals }) => {
	const { teamId } = params
	const team = await prisma.team.findUniqueOrThrow({
		where: { id: teamId },
		include: {
			leaders: {
				include: {
					user: {
						select: {
							firstName: true,
							lastName: true,
							email: true,
						},
					},
				},
			},
		},
	})

	// hide email if leader doesn't have valided his participation
	team.leaders = team.leaders.map((leader) =>
		leader.isValidedByUser
			? leader
			: {
					...leader,
					user: {
						firstName: leader.user.firstName,
						lastName: leader.user.lastName,
						email: '',
					},
			  }
	)

	return {
		team,
		isLeader: await isLeader(teamId, locals),
	}
}

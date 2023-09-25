import { isLeaderOrThrow, parseFormData, prisma, tryOrFail } from '$lib/server'
import { periodShema } from '$lib/form'
import { fail } from '@sveltejs/kit'

export const load = async ({ params, parent }) => {
	const { isLeader } = await parent()
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
							phone: true,
						},
					},
				},
			},
			periods: {
				orderBy: { start: 'asc' },
				include: {
					subscribes: isLeader ? { include: { member: { include: { user: true } } } } : true,
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
						phone: null,
					},
			  }
	)

	return { team }
}

export const actions = {
	new_period: async ({ params, request, locals }) => {
		const { teamId } = params
		await isLeaderOrThrow(teamId, locals)

		const { err, data } = await parseFormData(request, periodShema)
		if (err) return err

		return tryOrFail(() =>
			prisma.period.create({
				data: {
					...data,
					teamId,
				},
			})
		)
	},
}

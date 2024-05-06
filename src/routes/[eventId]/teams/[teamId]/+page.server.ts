import { error } from '@sveltejs/kit'
import { tryOrFail, parseFormData } from 'fuma/server'

import { prisma, permission } from '$lib/server'
import { modelPeriodCreate, validationPeriod } from '$lib/validation'
import { isMemberAllowed } from '$lib/member'

export const load = async ({ locals, parent, params: { teamId } }) => {
	const { member } = await parent()

	const isLeaderOfTeam = await permission
		.leaderOfTeam(teamId, locals)
		.then(() => true)
		.catch(() => false)

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
					subscribes: isLeaderOfTeam ? { include: { member: { include: { user: true } } } } : true,
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

	if (!isLeaderOfTeam && !isMemberAllowed(team.conditions, member)) error(403)

	return { isLeaderOfTeam, team }
}

export const actions = {
	new_period: async ({ request, locals, params: { teamId } }) => {
		await permission.leaderOfTeam(teamId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelPeriodCreate, validationPeriod)

			return prisma.period.create({
				data: {
					...data,
					teamId,
				},
			})
		})
	},
}

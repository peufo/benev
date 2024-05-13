import { addTeamComputedValues, hideTeamLeadersInfo, prisma } from '$lib/server'
import { isMemberAllowed } from '$lib/member'

export const load = async ({ parent, params, url }) => {
	const search = url.searchParams.get('search')
	const { member } = await parent()

	const teams = await prisma.team
		.findMany({
			where: {
				eventId: params.eventId,
				...(search && { name: { contains: search } }),
			},
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
				periods: { include: { subscribes: true } },
			},
			orderBy: {
				name: 'asc',
			},
		})
		.then((teams) => teams.map(addTeamComputedValues))
		.then((teams) => teams.map(hideTeamLeadersInfo))

	return {
		teams: teams.filter((team) => {
			return isMemberAllowed(team.conditions, member)
		}),
	}
}

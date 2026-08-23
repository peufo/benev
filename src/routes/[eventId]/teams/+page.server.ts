import z from 'zod'
import { filterBoolean, filterRange } from '$lib/models/filter'
import { parseQuery } from 'fuma/server'
import { useAddTeamComputedValues, prisma } from '$lib/server'
import { isMemberAllowed } from '$lib/member'
import type { Period } from '@prisma/client'

export const load = async ({ parent, url, params: { eventId } }) => {
	const { search, range, onlyAvailable } = parseQuery(url, {
		search: z.string().nullish(),
		range: filterRange,
		onlyAvailable: filterBoolean,
	})

	const { member, event } = await parent()

	const isLeader = member?.roles.includes('leader')

	const addTeamComputedValues = useAddTeamComputedValues({ member, event })

	const memberPeriodsId = member?.subscribes
		.map((sub) => sub.periodId)
		.filter((id, i, arr) => arr.indexOf(id) === i)
	const isMemberSubscribeToTeam = (periods: Period[]) =>
		!!(memberPeriodsId && periods.find((p) => memberPeriodsId.includes(p.id)))

	let teamsHiddenCount = 0
	const teams = await prisma.team
		.findMany({
			where: {
				eventId,
				...(search && { name: { contains: search } }),
			},
			include: {
				leaders: true,
				periods: {
					include: {
						subscribes: {
							include: {
								member: {
									select: { isValidedByUser: true },
								},
							},
						},
						tags: true,
					},
					orderBy: { start: 'asc' },
					...(range && { where: { end: { gte: range.start }, start: { lte: range.end } } }),
				},
			},
			orderBy: {
				position: 'asc',
			},
		})
		.then((teams) => teams.map(addTeamComputedValues))
		.then((teams) =>
			teams.filter((team) => {
				if (isLeader) return true
				if (isMemberAllowed(team.conditions, member)) return true
				if (isMemberSubscribeToTeam(team.periods)) return true
				teamsHiddenCount++
				return false
			})
		)
		.then((teams) => {
			if (!onlyAvailable) return teams
			return teams
				.filter((team) => team.isAvailable)
				.map((team) => ({ ...team, periods: team.periods.filter((p) => !p.isComplete) }))
		})

	return { teams, teamsHiddenCount }
}

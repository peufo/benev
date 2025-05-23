import { z } from 'fuma'
import { formAction, parseQuery } from 'fuma/server'
import { useAddTeamComputedValues, permission, prisma, safeUserSelect } from '$lib/server'
import { isMemberAllowed } from '$lib/member'
import { modelTeam, modelTeamUpdate } from '$lib/models'
import { error } from '@sveltejs/kit'
import type { Period } from '@prisma/client'

export const load = async ({ parent, url, params: { eventId } }) => {
	const { search, range, onlyAvailable, teams_order } = parseQuery(url, {
		search: z.string().nullish(),
		range: z.filter.range,
		onlyAvailable: z.filter.boolean,
		teams_order: z
			.string()
			.nullish()
			.transform((v) => !!v),
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
				leaders: {
					include: {
						user: {
							select: safeUserSelect,
						},
					},
				},
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

	const allTeams =
		teams_order && member?.roles.includes('admin')
			? await prisma.team.findMany({
					where: { eventId },
					select: { id: true, name: true },
					orderBy: { position: 'asc' },
			  })
			: []

	return { teams, allTeams, teamsHiddenCount }
}

export const actions = {
	team_create: formAction(modelTeam, async ({ locals, params: { eventId }, data }) => {
		await permission.admin(eventId, locals)
		return prisma.team.create({
			data: { ...data, eventId },
		})
	}),
	team_update: formAction(modelTeamUpdate, async ({ locals, data }) => {
		const member = await permission.leaderOfTeam(data.id, locals)
		if (!member.roles.includes('admin') && data.leaders) error(403)
		return prisma.team.update({ where: { id: data.id }, data })
	}),
	team_delete: formAction({ id: z.string() }, async ({ locals, params: { eventId }, data }) => {
		await permission.admin(eventId, locals)
		return prisma.team.delete({ where: { id: data.id } })
	}),
	teams_reorder: formAction(
		{ teams: z.jsonArray(z.object({ id: z.string(), position: z.number() })) },
		async ({ locals, data, params: { eventId } }) => {
			await permission.admin(eventId, locals)
			return prisma.$transaction(
				data.teams.map(({ id, position }) =>
					prisma.team.update({
						where: { id },
						data: { position },
					})
				)
			)
		}
	),
}

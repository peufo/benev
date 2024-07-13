import { z } from 'fuma'
import { formAction } from 'fuma/server'
import { useAddTeamComputedValues, permission, prisma, safeUserSelect } from '$lib/server'
import { isMemberAllowed } from '$lib/member'
import { modelTeam, modelTeamUpdate } from '$lib/models'
import { error } from '@sveltejs/kit'

export const load = async ({ parent, url, params: { eventId } }) => {
	const search = url.searchParams.get('search')
	const onlyAvailable = url.searchParams.get('onlyAvailable') === 'true'
	const teams_order = !!url.searchParams.get('teams_order')
	const { member, event } = await parent()

	const isLeader = member?.roles.includes('leader')

	const addTeamComputedValues = useAddTeamComputedValues({ member, event })

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
				periods: { include: { subscribes: true }, orderBy: { start: 'asc' } },
			},
			orderBy: {
				position: 'asc',
			},
		})
		.then((teams) => teams.map(addTeamComputedValues))
		.then((teams) => teams.filter((team) => isLeader || isMemberAllowed(team.conditions, member)))
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

	return { teams, allTeams }
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

import { formAction } from 'fuma/server'
import { addTeamComputedValues, permission, prisma } from '$lib/server'
import { isMemberAllowed } from '$lib/member'
import { modelTeam, modelTeamUpdate } from '$lib/models'
import { error } from '@sveltejs/kit'
import { z } from 'fuma'

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

	return {
		teams: teams.filter((team) => {
			return isMemberAllowed(team.conditions, member)
		}),
	}
}

export const actions = {
	team_create: formAction(modelTeam, async ({ data, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		return prisma.team.create({
			data: {
				...data,
				eventId,
			},
		})
	}),
	team_update: formAction(modelTeamUpdate, async ({ data, locals }) => {
		const teamId = data.id
		const member = await permission.leaderOfTeam(teamId, locals)
		if (!member.roles.includes('admin') && data.leaders) error(403)
		return prisma.team.update({
			where: { id: teamId },
			data,
		})
	}),
	team_delete: formAction({ id: z.string() }, async ({ data, locals, params: { eventId } }) => {
		await permission.admin(eventId, locals)
		prisma.team.delete({ where: data })
	}),
}

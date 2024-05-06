import { tryOrFail, parseFormData } from 'fuma/server'
import { modelTeamUpdate } from '$lib/validation/models/team'
import { prisma, permission } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async ({ locals, params: { teamId } }) => {
	await permission.leaderOfTeam(teamId, locals)

	return {
		team: await prisma.team.findUniqueOrThrow({
			where: { id: teamId },
			include: {
				leaders: {
					include: {
						user: true,
					},
				},
			},
		}),
	}
}

export const actions = {
	update: async ({ request, locals, params: { eventId, teamId } }) => {
		const member = await permission.leaderOfTeam(teamId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelTeamUpdate)
			if (!member.roles.includes('admin') && data.leaders) error(403)

			return prisma.team.update({
				where: { id: teamId },
				data,
			})
		}, `/${eventId}/teams/${teamId}`)
	},
	delete: async ({ locals, params: { eventId, teamId } }) => {
		await permission.admin(eventId, locals)
		return tryOrFail(
			() =>
				prisma.team.delete({
					where: { id: teamId },
				}),
			`/${eventId}/teams`
		)
	},
}

import { tryOrFail, parseFormData } from 'fuma/server'
import { modelTeamUpdate } from '$lib/models/team'
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

import { teamUpdate } from '$lib/validation/models/team'
import { parseFormData } from '$lib/server/formData'
import { prisma, tryOrFail, permission } from '$lib/server'
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

		const { err, data } = await parseFormData(request, teamUpdate)

		if (err) return err
		if (!member.roles.includes('admin') && data.leaders) throw error(403)

		return tryOrFail(
			() =>
				prisma.team.update({
					where: { id: teamId },
					data,
				}),
			`/${eventId}/teams/${teamId}`
		)
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

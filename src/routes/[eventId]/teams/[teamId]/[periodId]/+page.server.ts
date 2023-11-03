import { periodShemaUpdate } from '$lib/form'
import { parseFormData, prisma, tryOrFail, permission } from '$lib/server'

export const load = async ({ locals, params: { teamId, periodId } }) => {
	await permission.leaderOfTeam(teamId, locals)
	return {
		period: await prisma.period.findUniqueOrThrow({
			where: { id: periodId },
			include: { team: true, subscribes: { include: { member: { include: { user: true } } } } },
		}),
	}
}

// TODO: Avertire les membres inscrits

export const actions = {
	update_period: async ({ request, locals, params: { teamId } }) => {
		await permission.leaderOfTeam(teamId, locals)
		const { err, data } = await parseFormData(request, periodShemaUpdate)
		if (err) return err

		return tryOrFail(() =>
			prisma.period.update({
				where: { id: data.id },
				data,
			})
		)
	},
	delete_period: async ({ locals, params: { eventId, teamId, periodId } }) => {
		await permission.leaderOfTeam(teamId, locals)
		return tryOrFail(
			() => prisma.period.delete({ where: { id: periodId } }),
			teamId !== 'undefined' ? `/${eventId}/teams/${teamId}` : undefined
		)
	},
}

import { tryOrFail } from 'fuma/server'
import { periodUpdate, periodValidation } from '$lib/validation'
import { parseFormData, prisma, permission } from '$lib/server'
import { z } from '$lib/validation'

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
		const { err, data } = await parseFormData(request, periodUpdate, periodValidation)
		if (err) return err

		return tryOrFail(() =>
			prisma.period.update({
				where: { id: data.id },
				data,
			})
		)
	},
	delete_period: async ({ locals, request, params: { eventId, teamId, periodId } }) => {
		await permission.leaderOfTeam(teamId, locals)
		const { err, data } = await parseFormData(request, { disableRedirect: z.boolean() })
		if (err) return err
		return tryOrFail(
			() => prisma.period.delete({ where: { id: periodId } }),
			data.disableRedirect ? undefined : `/${eventId}/teams/${teamId}`
		)
	},
}

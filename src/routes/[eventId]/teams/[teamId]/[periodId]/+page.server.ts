import { tryOrFail, parseFormData } from 'fuma/server'
import { modelPeriodUpdate, validationPeriod } from '$lib/models'
import { prisma, permission } from '$lib/server'
import { z } from 'fuma/validation'

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
	period_update: async ({ request, locals, params: { teamId } }) => {
		await permission.leaderOfTeam(teamId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelPeriodUpdate, validationPeriod)

			return prisma.period.update({
				where: { id: data.id },
				data,
			})
		})
	},
	period_delete: async ({ locals, request, params: { eventId, teamId, periodId } }) => {
		await permission.leaderOfTeam(teamId, locals)

		return tryOrFail(
			async () => {
				const { data } = await parseFormData(request, { disableRedirect: z.boolean() })
				await prisma.period.delete({ where: { id: periodId } })
				return data
			},
			(data) => (data.disableRedirect ? undefined : `/${eventId}/teams/${teamId}`)
		)
	},
}

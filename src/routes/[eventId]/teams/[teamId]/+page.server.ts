import { error } from '@sveltejs/kit'
import { tryOrFail, parseFormData } from 'fuma/server'
import { z } from 'fuma'

import { prisma, permission, getTeam } from '$lib/server'
import { modelPeriodCreate, modelPeriodUpdate, validationPeriod } from '$lib/models'
import { isMemberAllowed } from '$lib/member'

export const load = async ({ locals, parent, params: { teamId } }) => {
	const { member, team } = await parent()

	const isLeaderOfTeam = await permission
		.leaderOfTeam(teamId, locals)
		.then(() => true)
		.catch(() => false)

	const _team = team || (await getTeam(teamId, isLeaderOfTeam))
	if (!isLeaderOfTeam && !isMemberAllowed(team.conditions, member)) error(403)
	return { isLeaderOfTeam, team: _team }
}

export const actions = {
	period_create: async ({ request, locals, params: { teamId } }) => {
		await permission.leaderOfTeam(teamId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelPeriodCreate, validationPeriod)

			return prisma.period.create({
				data: {
					...data,
					teamId,
				},
			})
		})
	},
	period_update: async ({ request, locals, params: { teamId } }) => {
		await permission.leaderOfTeam(teamId, locals)

		return tryOrFail(async () => {
			const { data } = await parseFormData(request, modelPeriodUpdate, validationPeriod)

			return prisma.period.update({
				where: { id: data.id, teamId },
				data,
			})
		})
	},
	period_delete: async ({ locals, request, params: { eventId, teamId } }) => {
		await permission.leaderOfTeam(teamId, locals)

		return tryOrFail(
			async () => {
				const { data } = await parseFormData(request, {
					disableRedirect: z.filter.boolean,
					id: z.string(),
				})
				await prisma.period.delete({ where: { id: data.id } })
				return data
			},
			(data) => (data.disableRedirect ? undefined : `/${eventId}/teams/${teamId}`)
		)
	},
}

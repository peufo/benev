import { error } from '@sveltejs/kit'
import { formAction } from 'fuma/server'
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
	if (!isLeaderOfTeam && !isMemberAllowed(_team.conditions, member)) error(403)
	return { isLeaderOfTeam, team: _team }
}

export const actions = {
	period_create: formAction(
		modelPeriodCreate,
		async ({ data, locals, params: { teamId } }) => {
			await permission.leaderOfTeam(teamId, locals)
			return prisma.period.create({
				data: {
					...data,
					teamId,
				},
			})
		},
		{
			validation: validationPeriod,
		}
	),
	period_update: formAction(
		modelPeriodUpdate,
		async ({ data, locals, params: { teamId } }) => {
			await permission.leaderOfTeam(teamId, locals)
			return prisma.period.update({
				where: { id: data.id, teamId },
				data,
			})
		},
		{
			validation: validationPeriod,
		}
	),
	period_delete: formAction(
		{
			redirectTo: z.string(),
			id: z.string(),
		},
		async ({ data, locals, params: { teamId } }) => {
			await permission.leaderOfTeam(teamId, locals)
			await prisma.period.delete({ where: { id: data.id } })
			return data.redirectTo
		},
		{ redirectTo: (url) => url }
	),
}

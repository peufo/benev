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

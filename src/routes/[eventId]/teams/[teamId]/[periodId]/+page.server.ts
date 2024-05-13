import { prisma, permission } from '$lib/server'

export const load = async ({ locals, params: { teamId, periodId } }) => {
	await permission.leaderOfTeam(teamId, locals)
	return {
		period: await prisma.period.findUniqueOrThrow({
			where: { id: periodId },
			include: { team: true, subscribes: { include: { member: { include: { user: true } } } } },
		}),
	}
}

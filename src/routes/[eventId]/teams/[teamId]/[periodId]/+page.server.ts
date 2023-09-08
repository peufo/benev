import { isLeaderInEventOrThrow, isLeaderOrThrow, prisma } from '$lib/server'

export const load = async ({ locals, params: { teamId, periodId } }) => {
	await isLeaderOrThrow(teamId, locals)
	return {
		period: await prisma.period.findUniqueOrThrow({
			where: { id: periodId },
			include: { team: true, subscribes: { include: { member: { include: { user: true } } } } },
		}),
	}
}

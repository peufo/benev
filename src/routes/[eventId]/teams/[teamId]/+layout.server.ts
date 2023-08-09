import { isLeader, prisma } from '$lib/server'

export const load = async ({ params, locals }) => {
	const { teamId } = params

	return {
		isLeader: await isLeader(teamId, locals),
		team: await prisma.team.findUniqueOrThrow({
			where: { id: teamId },
			include: { leaders: { include: { user: true } } },
		}),
	}
}

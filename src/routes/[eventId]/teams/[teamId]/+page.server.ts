import { prisma } from '$lib/server'

export const load = async ({ params }) => {
	const { teamId } = params

	return {
		team: prisma.team.findUniqueOrThrow({ where: { id: teamId } }),
		periods: prisma.period.findMany({ where: { teamId }, include: {subscribes: true} }),
	}
}

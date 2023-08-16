import { isLeader, prisma } from '$lib/server'

export const load = async ({ params, locals, parent }) => {
	const session = await locals.auth.validate()
	const { teamId, eventId } = params

	const member = session
		? await prisma.member.findUnique({
				where: { userId_eventId: { userId: session.user.id, eventId } },
		  })
		: null

	return {
		member,
		isLeader: await isLeader(teamId, locals),
		team: await prisma.team.findUniqueOrThrow({
			where: { id: teamId },
			include: { leaders: { include: { user: true } } },
		}),
	}
}

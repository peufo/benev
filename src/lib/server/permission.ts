import { error } from '@sveltejs/kit'
import { prisma } from '.'

export async function isOwner(eventId: string, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) throw error(401)

	const { ownerId } = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		select: { ownerId: true },
	})
	if (ownerId !== session.user.userId) throw error(401)
	return
}

export async function isOwnerOrLeader(teamId: string, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) throw error(401)

	const team = await prisma.team.findUniqueOrThrow({
		where: { id: teamId },
		include: {
			event: { select: { ownerId: true } },
			leaders: { select: { id: true } },
		},
	})

	const _isOwner = team.event.ownerId === session.user.userId
	const _isLeader = team.leaders.map(({ id }) => id).includes(session.user.userId)
	if (!_isOwner && !_isLeader) throw error(401)

	return
}

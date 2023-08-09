import { error } from '@sveltejs/kit'
import { prisma } from '.'

export async function isOwner(eventId: string, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) return false

	const { ownerId } = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		select: { ownerId: true },
	})
	if (ownerId !== session.user.userId) return false
	return true
}
export async function isOwnerOrThrow(eventId: string, locals: App.Locals) {
	const ok = await isOwner(eventId, locals)
	if (!ok) throw error(401)
}

export async function isLeader(teamId: string, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) return false

	const team = await prisma.team.findUniqueOrThrow({
		where: { id: teamId },
		include: {
			event: { select: { ownerId: true } },
			leaders: { select: { userId: true } },
		},
	})

	const _isOwner = team.event.ownerId === session.user.userId
	const _isLeader = team.leaders.map(({ userId }) => userId).includes(session.user.userId)
	if (!_isOwner && !_isLeader) return false

	return true
}

export async function isLeaderOrThrow(teamId: string, locals: App.Locals) {
	const ok = await isLeader(teamId, locals)
	if (!ok) throw error(401)
}

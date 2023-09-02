import { error, redirect } from '@sveltejs/kit'
import { prisma } from '.'
import { ROOT_USER } from '$env/static/private'

export async function isRoot(locals: App.Locals) {
	const session = await locals.auth.validate()
	return session?.user.email === ROOT_USER
}

export async function isOwner(eventId: string, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) return false

	if (await isRoot(locals)) return true

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

export async function isLeaderInEvent(eventId: string, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) return false
	if (await isOwner(eventId, locals)) return true

	const member = await prisma.member.findUnique({
		where: { userId_eventId: { eventId, userId: session.user.id } },
		include: { leaderOf: true },
	})
	if (member?.leaderOf.length) return true
	return false
}

export async function isLeader(teamId: string, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) return false

	if (await isRoot(locals)) return true

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

export async function getUserIdOrRedirect(url: URL, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) {
		console.log('REDIRECT', `/me?callback=${url.pathname}`)
		throw redirect(302, `/me?callback=${url.pathname}`)
	}
	return session.user.id
}

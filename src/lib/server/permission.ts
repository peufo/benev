import { error, redirect } from '@sveltejs/kit'
import { ROOT_USER } from '$env/static/private'
import { prisma } from '$lib/server'
import {
	type MemberRole,
	type MemberWithComputedValues,
	getMemberProfile,
} from '$lib/server/member'

export const permission = {
	root: rootPermission,
	member: createEventPermission('member'),
	leader: createEventPermission('leader'),
	admin: createEventPermission('admin'),
	owner: createEventPermission('owner'),
	leaderOfTeam,
}

async function rootPermission(locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) throw error(401)

	session.user.email === ROOT_USER
}

function createEventPermission(role: MemberRole) {
	return async (eventId: string, locals: App.Locals): Promise<MemberWithComputedValues> => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)
		// TODO: a optimisé en utilisant parent() dans les load()
		const member = await getMemberProfile({ userId: session.user.id, eventId })
		const allowed = member.roles.includes(role)
		if (!allowed) throw error(403)
		return member
	}
}

async function leaderOfTeam(teamId: string, locals: App.Locals): Promise<MemberWithComputedValues> {
	const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } })
	const member = await createEventPermission('leader')(team.eventId, locals)
	if (!member.roles.includes('admin')) {
		const isLeaderOfTeam = member.leaderOf.find((t) => t.id === teamId)
		if (!isLeaderOfTeam) throw error(403)
	}
	return member
}

export function redirectToAuth(url: URL) {
	return redirect(302, `/auth?redirectTo=${url.pathname}`)
}
export function redirectToRegister(eventId: string, url: URL) {
	return redirect(302, `/${eventId}/register?redirectTo=${url.pathname}`)
}
export async function getUserIdOrRedirect(url: URL, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) throw redirectToAuth(url)
	return session.user.id
}
export async function getUserOrRedirect(url: URL, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) throw redirectToAuth(url)
	return session.user
}

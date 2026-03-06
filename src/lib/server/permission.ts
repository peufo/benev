import { error, redirect } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { prisma } from '$lib/server'
import {
	type MemberRole,
	type MemberWithComputedValuesAndAccount,
	getMemberProfile,
} from '$lib/server/member'
import type { Session } from 'lucia'

export const permission = {
	root: rootPermission,
	member: createMemberPermission('member'),
	leader: createMemberPermission('leader'),
	admin: createMemberPermission('admin'),
	owner: createMemberPermission('owner'),
	memberOrRoot: createMemberOrRootPermission('member'),
	leaderOrRoot: createMemberOrRootPermission('leader'),
	adminOrRoot: createMemberOrRootPermission('admin'),
	ownerOrRoot: createMemberOrRootPermission('owner'),
	leaderOfTeam,
}

async function rootPermission(locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) error(401)
	return session.user.email === env.ROOT_USER
}

function createMemberPermission(role: MemberRole) {
	return async (
		eventId: string,
		locals: App.Locals
	): Promise<MemberWithComputedValuesAndAccount> => {
		const session = await locals.auth.validate()
		if (!session) error(401)
		return checkMemberRole(session, eventId, role)
	}
}

function createMemberOrRootPermission(role: MemberRole) {
	return async (
		eventId: string,
		locals: App.Locals
	): Promise<MemberWithComputedValuesAndAccount | null> => {
		const session = await locals.auth.validate()
		if (!session) error(401)
		if (session.user.email === env.ROOT_USER) return null
		return checkMemberRole(session, eventId, role)
	}
}

async function checkMemberRole(
	session: Session,
	eventId: string,
	role: MemberRole
): Promise<MemberWithComputedValuesAndAccount> {
	try {
		const member = await getMemberProfile({ userId: session.user.id, eventId })
		if (!member.roles.includes(role)) throw new Error(`Member don't have role '${role}'`)
		return { ...member, email: session.user.email, userId: session.user.id }
	} catch (e) {
		error(403)
	}
}

async function leaderOfTeam(
	teamId: string,
	locals: App.Locals
): Promise<MemberWithComputedValuesAndAccount> {
	const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } })
	const member = await createMemberPermission('leader')(team.eventId, locals)
	if (!member.roles.includes('admin')) {
		const isLeaderOfTeam = member.leaderOf.find((t) => t.id === teamId)
		if (!isLeaderOfTeam) error(403)
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

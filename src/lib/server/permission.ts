import { error, redirect } from '@sveltejs/kit'
import { prisma } from '.'
import { type MemberRole, type MemberWithRoles, getMemberProfile } from '$lib/server/member'

const getPermission = (role: MemberRole) => async (eventId: string, locals: App.Locals) => {
	const session = await locals.auth.validate()
	if (!session) throw error(401)
	// TODO: a optimisé en utilisant parent() dans les load()
	const member = await getMemberProfile({ userId: session.user.id, eventId })
	const allowed = member.roles.includes(role)
	if (!allowed) throw error(403)
	return member
}

export const permission = {
	member: getPermission('member'),
	leader: getPermission('leader'),
	admin: getPermission('admin'),
	owner: getPermission('owner'),
	leaderOfTeam,
} satisfies Record<MemberRole | 'leaderOfTeam', (...args: any[]) => Promise<MemberWithRoles>>

async function leaderOfTeam(teamId: string, locals: App.Locals) {
	const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } })
	const member = await getPermission('leader')(team.eventId, locals)
	if (!member.roles.includes('admin')) {
		const isLeaderOfTeam = member.leaderOf.find((t) => t.id === teamId)
		if (!isLeaderOfTeam) throw error(403)
	}
	return member
}

export function redirectToAuth(url: URL) {
	return redirect(302, `/auth?callback=${url.pathname}`)
}
export async function getUserIdOrRedirect(url: URL, locals: App.Locals) {
	const session = await locals.auth.validate()
	if (!session) throw redirectToAuth(url)
	return session.user.id
}

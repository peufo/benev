import { error, redirect } from '@sveltejs/kit'
import { prisma } from '.'
import { type MemberRole, type MemberWithRole, getMemberWithRole } from '$lib/server/memberRole'

const getPermission =
	(...roles: MemberRole[]) =>
	async (eventId: string, locals: App.Locals) => {
		const session = await locals.auth.validate()
		if (!session) throw error(401)
		const member = await getMemberWithRole(session.user.id, eventId)
		const allowed = roles.includes(member.role)
		if (!allowed) throw error(401)
		return member
	}

export const permission = {
	member: getPermission('member'),
	leader: getPermission('member', 'leader'),
	admin: getPermission('member', 'leader', 'admin'),
	owner: getPermission('member', 'leader', 'admin', 'owner'),
	leaderOfTeam,
} satisfies Record<MemberRole | 'leaderOfTeam', (...args: any[]) => Promise<MemberWithRole>>

async function leaderOfTeam(teamId: string, locals: App.Locals) {
	const team = await prisma.team.findUniqueOrThrow({ where: { id: teamId } })
	const member = await getPermission('member', 'leader')(team.eventId, locals)
	if (member.role === 'leader') {
		const isLeaderOfTeam = member.leaderOf.find((t) => t.id === teamId)
		if (!isLeaderOfTeam) throw error(401)
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

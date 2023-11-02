import { ROOT_USER } from '$env/static/private'
import { Member, Team } from '@prisma/client'

export type MemberRole = 'member' | 'leader' | 'admin' | 'owner'
export type MemberWithRoleInfo = Member & {
	user: { email: string }
	event: { ownerId: string }
	leaderOf: Team[]
}

export function getMemberRole(member: MemberWithRoleInfo): MemberRole {
	const isRoot = member.user.email === ROOT_USER
	const isOwner = member.event.ownerId === member.userId
	if (isRoot || isOwner) return 'owner'
	if (member.isAdmin) return 'admin'
	if (member.leaderOf.length) return 'leader'
	return 'member'
}

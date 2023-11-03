import { ROOT_USER } from '$env/static/private'
import { Member, Team, User } from '@prisma/client'
import { prisma } from '.'

export type MemberRole = 'member' | 'leader' | 'admin' | 'owner'
export type MemberWithRoleInfo = Member & {
	user: User
	event: { ownerId: string }
	leaderOf: Team[]
}
export type MemberWithRole = MemberWithRoleInfo & { role: MemberRole }

export function getMemberRole(member: MemberWithRoleInfo): MemberRole {
	const isRoot = member.user.email === ROOT_USER
	const isOwner = member.event.ownerId === member.userId
	if (isRoot || isOwner) return 'owner'
	if (member.isAdmin) return 'admin'
	if (member.leaderOf.length) return 'leader'
	return 'member'
}

export async function getMemberWithRole(userId: string, eventId: string): Promise<MemberWithRole> {
	const member = await prisma.member.findUniqueOrThrow({
		where: { userId_eventId: { userId, eventId } },
		include: {
			user: true,
			event: { select: { ownerId: true } },
			leaderOf: true,
		},
	})
	return { ...member, role: getMemberRole(member) }
}

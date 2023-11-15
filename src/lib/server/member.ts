import { ROOT_USER } from '$env/static/private'
import type { Member, Team, User } from '@prisma/client'
import { prisma } from './index'

export type MemberRole = 'member' | 'leader' | 'admin' | 'owner' | 'root'
export type MemberWithRolesInfo = Member & {
	user: User
	event: { ownerId: string }
	leaderOf: Team[]
}
export type MemberWithRoles = MemberWithRolesInfo & { roles: MemberRole[] }

export function getMemberRoles(member: MemberWithRolesInfo): MemberRole[] {
	const isRoot = member.user.email === ROOT_USER
	const isOwner = member.event.ownerId === member.userId
	if (isRoot) return ['root', 'owner', 'admin', 'leader', 'member']
	if (isOwner) return ['owner', 'admin', 'leader', 'member']
	if (member.isAdmin) return ['admin', 'leader', 'member']
	if (member.leaderOf.length) return ['leader', 'member']
	return ['member']
}

export type MemberProfile = Awaited<ReturnType<typeof getMemberProfile>>

type MemberUniqueWhere =
	| { memberId: string; userId?: undefined; eventId?: undefined }
	| { memberId?: undefined; userId: string; eventId: string }

export function getMemberProfile(where: MemberUniqueWhere) {
	const _where =
		where.memberId !== undefined
			? { id: where.memberId }
			: { userId_eventId: { userId: where.userId, eventId: where.eventId } }

	return prisma.member
		.findUniqueOrThrow({
			where: _where,
			include: {
				user: true,
				event: {
					include: { memberFields: { orderBy: { position: 'asc' } } },
				},
				profile: { include: { field: true } },
				subscribes: {
					include: { period: { include: { team: true } } },
				},
				leaderOf: {
					include: {
						leaders: { include: { user: true } },
						periods: { include: { subscribes: true } },
					},
				},
			},
		})
		.then((member) => ({
			...member,
			roles: getMemberRoles(member),
		}))
		.then((member) => ({
			...member,
			profile: member.profile.filter(
				({ field }) => member.roles.includes('leader') || field.memberCanRead
			),
			event: {
				...member.event,
				memberFields: member.event.memberFields.filter(
					(field) => member.roles.includes('leader') || field.memberCanRead
				),
			},
		}))
}

import { ROOT_USER } from '$env/static/private'
import type { Member, Team, User, Event } from '@prisma/client'
import { prisma } from './index'

export type MemberRole = 'member' | 'leader' | 'admin' | 'owner' | 'root'
type MemberWithUserEventAndLeaderOf = Member & {
	user: User
	event: Event
	leaderOf: Team[]
}
export type MemberWithComputedValues = MemberWithUserEventAndLeaderOf & {
	roles: MemberRole[]
	userProfileRequiredFields: string[]
	isUserProfileCompleted: boolean
	isMemberProfileCompleted: boolean
}

export function addMemberComputedValues<T extends MemberWithUserEventAndLeaderOf>(
	member: T
): T & MemberWithComputedValues {
	const userProfileRequiredFields = getUserProfileRequiredFIelds(member)
	return {
		...member,
		roles: getMemberRoles(member),
		userProfileRequiredFields,
		isUserProfileCompleted: !userProfileRequiredFields.length,

		// TODO
		isMemberProfileCompleted: true,
	}
}

function getMemberRoles(member: MemberWithUserEventAndLeaderOf): MemberRole[] {
	const isRoot = member.user.email === ROOT_USER
	const isOwner = member.event.ownerId === member.userId
	if (isRoot) return ['root', 'owner', 'admin', 'leader', 'member']
	if (isOwner) return ['owner', 'admin', 'leader', 'member']
	if (member.isAdmin) return ['admin', 'leader', 'member']
	if (member.leaderOf.length) return ['leader', 'member']
	return ['member']
}

function getUserProfileRequiredFIelds({ event, user }: MemberWithUserEventAndLeaderOf) {
	const requiredFields: string[] = []
	if (event.userAddressRequired) {
		if (!user.street) requiredFields.push('street')
		if (!user.zipCode) requiredFields.push('zipCode')
		if (!user.city) requiredFields.push('city')
	}
	if (event.userAvatarRequired && !user.avatarId) requiredFields.push('avatarId')
	if (event.userBirthdayRequired && !user.birthday) requiredFields.push('birthday')
	if (event.userPhoneRequired && !user.phone) requiredFields.push('phone')
	return requiredFields
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
		.then(addMemberComputedValues)
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

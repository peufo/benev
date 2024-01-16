import { ROOT_USER } from '$env/static/private'
import type { Member, Team, User, Event, Field } from '@prisma/client'
import { addTeamComputedValues, prisma } from '$lib/server'

export type MemberRole = 'member' | 'leader' | 'admin' | 'owner' | 'root'
type MemberWithUserEventAndLeaderOf = Member & {
	user: User
	event: Event & { memberFields: Field[] }
	leaderOf: Team[]
}

export type MemberWithComputedValues = MemberWithUserEventAndLeaderOf & {
	roles: MemberRole[]
	userProfileRequiredFields: string[]
	isUserProfileCompleted: boolean
	memberProfileRequiredFields: string[]
	isMemberProfileCompleted: boolean
}

export function addMemberComputedValues<T extends MemberWithUserEventAndLeaderOf>(
	member: T
): T & MemberWithComputedValues {
	console.log(JSON.stringify(member, null, 2))
	const userProfileRequiredFields = getUserProfileRequiredFIelds(member)
	const memberProfileRequiredFields = getMemberProfileRequiredFields(member)
	return {
		...member,
		roles: getMemberRoles(member),
		userProfileRequiredFields,
		isUserProfileCompleted: !userProfileRequiredFields.length,
		memberProfileRequiredFields,
		isMemberProfileCompleted: !memberProfileRequiredFields.length,
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

function getMemberProfileRequiredFields({ profileJson, event }: MemberWithUserEventAndLeaderOf) {
	const requiredFields: string[] = []
	event.memberFields.forEach((field) => {
		if (!field.required || !field.memberCanRead) return
		if (field.type === 'boolean' || field.type === 'multiselect') return
		const fieldValue = profileJson[field.id]
		if (!fieldValue) requiredFields.push(field.name)
	})
	return requiredFields
}

export type MemberProfile = Awaited<ReturnType<typeof getMemberProfile>>

type MemberUniqueWhere =
	| { memberId: string; userId?: undefined; eventId?: undefined }
	| { memberId?: undefined; userId: string; eventId: string }

export function getMemberProfile(where: MemberUniqueWhere, accesor?: MemberWithComputedValues) {
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
		.then((member) => hidePrivateProfilValues(member, accesor))
		.then((member) => ({
			...member,
			leaderOf: member.leaderOf.map(addTeamComputedValues),
			event: {
				...member.event,
				memberFields: member.event.memberFields.filter(
					(field) => (accesor || member).roles.includes('leader') || field.memberCanRead
				),
			},
		}))
}

export function hidePrivateProfilValues<T extends MemberWithComputedValues>(
	member: T,
	accesor?: MemberWithComputedValues
) {
	return {
		...member,
		profile: Object.keys(member.profileJson).filter((fieldId) => {
			const field = member.event.memberFields.find((f) => f.id === fieldId)
			return (accesor || member).roles.includes('leader') || field?.memberCanRead
		}),
	}
}

import { ROOT_USER } from '$env/static/private'
import type { Prisma } from '@prisma/client'
import type { Member, Team, User, Event, Field } from '@prisma/client'
import { useAddTeamComputedValues, prisma, type AddTeamComputedValuesContext } from '$lib/server'

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

export function getMemberProfile(
	where: Prisma.MemberWhereInput,
	ctx?: AddTeamComputedValuesContext
) {
	const addTeamComputedValues = useAddTeamComputedValues(ctx)

	return prisma.member
		.findFirstOrThrow({
			where,
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
		.then((member) => hidePrivateProfilValues(member, ctx?.member))
		.then((member) => ({
			...member,
			leaderOf: member.leaderOf.map(addTeamComputedValues),
			event: {
				...member.event,
				memberFields: member.event.memberFields.filter(
					(field) => (ctx?.member || member).roles.includes('leader') || field.memberCanRead
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

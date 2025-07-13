import { ROOT_USER } from '$env/static/private'
import type { Prisma, Subscribe } from '@prisma/client'
import type { Member, Team, User, Event, Field } from '@prisma/client'
import {
	useAddTeamComputedValues,
	prisma,
	type AddTeamComputedValuesContext,
	type TeamWithComputedValues,
} from '$lib/server'

export type MemberRole = 'member' | 'leader' | 'admin' | 'owner' | 'root'
type MemberWithEventAndLeaderOf = Member & {
	event: Event & { memberFields: Field[] }
	leaderOf: Team[]
}

export type MemberWithComputedValues = MemberWithEventAndLeaderOf & {
	roles: MemberRole[]
	userProfileRequiredFields: string[]
	isUserProfileCompleted: boolean
	memberProfileRequiredFields: string[]
	isMemberProfileCompleted: boolean
}

export function addMemberComputedValues<T extends MemberWithEventAndLeaderOf>(
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

function getMemberRoles(member: MemberWithEventAndLeaderOf): MemberRole[] {
	//TODO: find better method for root user
	//const isRoot = member.user.email === ROOT_USER
	const isOwner = member.event.ownerId === member.userId
	//if (isRoot) return ['root', 'owner', 'admin', 'leader', 'member']
	if (isOwner) return ['owner', 'admin', 'leader', 'member']
	if (member.isAdmin) return ['admin', 'leader', 'member']
	if (member.leaderOf.length) return ['leader', 'member']
	return ['member']
}

function getUserProfileRequiredFIelds({ event, ...member }: MemberWithEventAndLeaderOf) {
	const requiredFields: string[] = []
	if (event.userAddressRequired) {
		if (!member.street) requiredFields.push('street')
		if (!member.zipCode) requiredFields.push('zipCode')
		if (!member.city) requiredFields.push('city')
	}
	if (event.userAvatarRequired && !member.avatarId) requiredFields.push('avatarId')
	if (event.userBirthdayRequired && !member.birthday) requiredFields.push('birthday')
	if (event.userPhoneRequired && !member.phone) requiredFields.push('phone')
	if (event.userEmailVerifiedRequired && member.userId && !member.isEmailVerified)
		requiredFields.push('isEmailVerified')
	return requiredFields
}

function getMemberProfileRequiredFields({ profileJson, event }: MemberWithEventAndLeaderOf) {
	const requiredFields: string[] = []
	event.memberFields.forEach((field) => {
		if (!field.required || !field.memberCanRead) return
		if (field.type === 'boolean' || field.type === 'multiselect') return
		const fieldValue = profileJson[field.id]
		if (!fieldValue) requiredFields.push(field.name)
	})
	return requiredFields
}

export type MemberProfile = MemberWithComputedValues & {
	leaderOf: TeamWithComputedValues[]
	subscribes: Subscribe[]
}

export async function getMemberProfile(
	where: Prisma.MemberWhereInput,
	ctx?: AddTeamComputedValuesContext
): Promise<MemberProfile> {
	const member = await prisma.member.findFirstOrThrow({
		where,
		include: {
			event: {
				include: { memberFields: { orderBy: { position: 'asc' } } },
			},
			subscribes: {
				include: { period: { include: { team: true } } },
			},
			leaderOf: {
				include: {
					leaders: { include: { user: true } },
					periods: {
						include: {
							subscribes: {
								include: {
									member: {
										select: { isValidedByUser: true },
									},
								},
							},
							tags: true,
						},
					},
				},
			},
		},
	})

	// TODO: use pipeline ... J'ai honte
	const addTeamComputedValues = useAddTeamComputedValues({
		...ctx,
		isLeader: true,
		event: member.event,
	})
	const res1 = addMemberComputedValues(member)
	const res2 = hidePrivateProfilValues(res1, ctx?.member)
	const res3 = {
		...res2,
		leaderOf: member.leaderOf.map(addTeamComputedValues),
		event: {
			...member.event,
			memberFields: member.event.memberFields.filter(
				(field) => (ctx?.member || res2).roles.includes('leader') || field.memberCanRead
			),
		},
	}
	return res3
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

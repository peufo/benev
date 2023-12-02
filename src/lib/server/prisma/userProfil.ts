import type { Member, Prisma, User, Event } from '@prisma/client'
import { prisma } from '.'

/**
 * Si les options d'évenement lié au profil utilisateur change
 * On teste l'ensemble des profil utilisateurs pour mettre à jour "isUserProfileCompleted"
 */
export async function testEventUserSettingsUpdate(args: Prisma.EventUpdateArgs) {
	if (isMemberSettingsUpdated(args.data)) await testAllUsersProfil(args.where)
}

function isMemberSettingsUpdated(event: Prisma.EventUpdateInput) {
	if (event.userAddressRequired !== undefined) return true
	if (event.userAvatarRequired !== undefined) return true
	if (event.userBirthdayRequired !== undefined) return true
	if (event.userPhoneRequired !== undefined) return true
	return false
}

async function testAllUsersProfil(where: Prisma.EventWhereUniqueInput) {
	const { members, ...event } = await prisma.event.findUniqueOrThrow({
		where,
		include: { members: { include: { user: true } } },
	})
	await Promise.all(members.map((member) => testUserProfil(member, event)))
}

async function testUserProfil(member: Member & { user: User }, event: Event) {
	const { user } = member
	const conditions = [
		!event.userAddressRequired || !!(user.street && user.zipCode && user.city),
		!event.userAvatarRequired || !!user.avatarId,
		!event.userBirthdayRequired || !!user.birthday,
		!event.userPhoneRequired || !!user.phone,
	]
	const isCompleted = conditions.filter(Boolean).length === conditions.length
	if (isCompleted === member.isUserProfileCompleted) return
	return prisma.member.update({
		where: { id: member.id },
		data: { isUserProfileCompleted: isCompleted },
	})
}

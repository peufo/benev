import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server'

export async function ensureLicences(eventId: string) {
	await ensureLicenceEvent(eventId)
	await ensureLicenceMembers(eventId)
}

export async function ensureLicenceEvent(eventId: string) {
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { licence: true },
	})
	if (event.licence) return

	const licenceEvent = await prisma.licence.findFirstOrThrow({
		where: {
			ownerId: event.ownerId,
			type: 'event',
			eventId: null,
		},
		orderBy: {
			createdAt: 'asc',
		},
	})

	await prisma.licence.update({
		where: { id: licenceEvent.id },
		data: { eventId },
	})
}

export async function ensureLicenceMembers(eventId: string) {
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId, licence: { isNot: null } },
		select: { id: true, ownerId: true, missingLicencesMember: true },
	})

	await removeUselessMemberLicence(event)

	const membersWithoutLicence = await prisma.member.findMany({
		where: { eventId, licence: null, isValidedByEvent: true },
	})
	if (!membersWithoutLicence.length) {
		await prisma.event.update({
			where: { id: event.id },
			data: { missingLicencesMember: 0 },
		})
		return
	}

	const licencesMember = await prisma.licence.findMany({
		where: {
			ownerId: event.ownerId,
			memberId: null,
			type: 'member',
		},
		orderBy: {
			createdAt: 'asc',
		},
	})

	const licencesUpdateArgs: Prisma.LicenceUpdateArgs[] = []
	licencesMember.every((licence) => {
		const member = membersWithoutLicence.shift()
		if (!member) return false
		licencesUpdateArgs.push({
			where: { id: licence.id },
			data: { memberId: member.id },
		})
		return true
	})

	await prisma.$transaction(licencesUpdateArgs.map((args) => prisma.licence.update(args)))

	await updateMissingLicencesMember(event)
}

async function removeUselessMemberLicence(event: { id: string; ownerId: string }) {
	const membersWithUselessLicence = await prisma.member.findMany({
		where: { eventId: event.id, licence: { isNot: null }, isValidedByEvent: false },
		select: { id: true },
	})

	if (!membersWithUselessLicence.length) return

	await prisma.$transaction(
		membersWithUselessLicence.map((m) =>
			prisma.licence.update({
				where: { memberId: m.id, type: 'member' },
				data: { memberId: null },
			})
		)
	)
}

async function updateMissingLicencesMember(event: { id: string; missingLicencesMember: number }) {
	const missingLicencesMember = await prisma.member.count({
		where: { eventId: event.id, isValidedByEvent: true, licence: null },
	})

	if (missingLicencesMember !== event.missingLicencesMember) {
		await prisma.event.update({
			where: { id: event.id },
			data: { missingLicencesMember },
		})
	}
}

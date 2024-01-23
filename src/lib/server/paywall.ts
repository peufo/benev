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
	const membersWithoutLicence = await prisma.member.findMany({
		where: { eventId, licence: null },
	})
	if (!membersWithoutLicence.length) return

	const { ownerId } = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		select: { ownerId: true },
	})

	const licencesMember = await prisma.licence.findMany({
		where: {
			ownerId,
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

	if (membersWithoutLicence.length)
		throw Error(`${membersWithoutLicence.length} member licences missing`)
}

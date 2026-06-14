import type { Event, User } from '@prisma/client'
import { prisma } from '$lib/server/prisma'
import { sendEmailComponent } from '$lib/server/email'
import { EVENT_TIER } from '$lib/constant'
import { EmailTierQuotaAlert } from '$lib/email'

export async function notifyTierQuotaIfNeeded(eventId: string) {
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId, deletedAt: null },
		include: { owner: true },
	})

	const tierConfig = EVENT_TIER[event.tier]
	const max = tierConfig.max
	if (max === null) return

	const membersValided = await prisma.member.count({
		where: { eventId, isValidedByEvent: true },
	})

	const ratio = membersValided / max

	if (ratio >= 1 && !event.notifiedQuota100) {
		await sendQuotaAlert({ event, membersValided, ratio, threshold: 100 })
		await prisma.event.update({
			where: { id: eventId },
			data: { notifiedQuota100: new Date() },
		})
		return
	}

	if (ratio >= 0.9 && !event.notifiedQuota90) {
		await sendQuotaAlert({ event, membersValided, ratio, threshold: 90 })
		await prisma.event.update({
			where: { id: eventId },
			data: { notifiedQuota90: new Date() },
		})
		return
	}

	if (ratio >= 0.8 && !event.notifiedQuota80) {
		await sendQuotaAlert({ event, membersValided, ratio, threshold: 80 })
		await prisma.event.update({
			where: { id: eventId },
			data: { notifiedQuota80: new Date() },
		})
	}
}

async function sendQuotaAlert({
	event,
	membersValided,
	ratio,
	threshold,
}: {
	event: Event & { owner: User }
	membersValided: number
	ratio: number
	threshold: 80 | 90 | 100
}) {
	if (!event.owner.email) return
	await sendEmailComponent(EmailTierQuotaAlert, {
		to: event.owner.email,
		subject: `Alerte quota - ${event.name}`,
		props: {
			event,
			owner: event.owner,
			membersValided,
			ratio,
			threshold,
			tier: event.tier,
		},
	})
}

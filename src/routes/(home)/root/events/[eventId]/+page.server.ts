import { error } from '@sveltejs/kit'
import { prisma } from '$lib/server'
import type { SubscribeState } from '@prisma/client'

export const load = async ({ params }) => {
	const event = await prisma.event.findUnique({
		where: { id: params.eventId },
		include: { owner: true },
	})
	if (!event) error(404, 'Événement introuvable')

	const periods = await prisma.period.findMany({
		where: { team: { eventId: params.eventId } },
		include: { subscribes: true },
	})

	const shiftsCount = periods.length
	const plannedWorkMs = periods.reduce(
		(acc, period) => acc + period.maxSubscribe * (period.end.getTime() - period.start.getTime()),
		0
	)
	const confirmedWorkMs = periods.reduce((acc, period) => {
		const acceptedCount = period.subscribes.filter((s) => s.state === 'accepted').length
		const periodDuration = period.end.getTime() - period.start.getTime()
		return acc + acceptedCount * periodDuration
	}, 0)

	const subscribesByState = periods.reduce<Record<SubscribeState, number>>(
		(acc, period) => {
			period.subscribes.forEach((subscribe) => {
				acc[subscribe.state] += 1
			})
			return acc
		},
		{ request: 0, accepted: 0, denied: 0, cancelled: 0 }
	)

	const membersCount = await prisma.member.count({
		where: { eventId: params.eventId },
	})

	return {
		event,
		stats: {
			shiftsCount,
			plannedWorkMs,
			confirmedWorkMs,
			membersCount,
			subscribesByState,
		},
	}
}

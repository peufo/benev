import { prisma } from '$lib/server'
import { error } from '@sveltejs/kit'

export const load = async () => {
	const subscribe = await prisma.subscribe.findFirst({
		include: {
			member: { select: { firstName: true } },
			period: { include: { team: { include: { event: true } } } },
		},
	})
	if (!subscribe) error(404)
	const { period } = subscribe
	return {
		member: subscribe.member,
		event: period.team.event,
		teamName: period.team.name,
		before: { start: period.start, end: period.end },
		after: {
			start: new Date(period.start.getTime() + 60 * 60 * 1000),
			end: new Date(period.end.getTime() + 60 * 60 * 1000),
		},
	}
}

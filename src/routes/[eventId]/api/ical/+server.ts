import ical, { ICalCalendarMethod } from 'ical-generator'
import { prisma, permission } from '$lib/server'

export const GET = async ({ params: { eventId }, locals }) => {
	const member = await permission.member(eventId, locals)

	const memberTeams = await prisma.team.findMany({
		where: { periods: { some: { subscribes: { some: { memberId: member.id } } } } },
		include: {
			event: { select: { name: true } },
			periods: {
				where: { subscribes: { some: { memberId: member.id } } },
				include: { tags: true },
			},
		},
	})

	const calendar = ical({
		name: `Mon bénévolat - ${member.event.name}`,
		method: ICalCalendarMethod.REQUEST,
	})

	for (const team of memberTeams) {
		for (const period of team.periods) {
			calendar.createEvent({
				start: period.start,
				end: period.end,
				summary: team.name,
				description: period.tags.map((t) => t.name).join(', ') || undefined,
				location: team.event.name,
			})
		}
	}

	return new Response(calendar.toString(), {
		headers: {
			'Content-type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'attachment; filename="mon-benevolat.ics"',
		},
	})
}

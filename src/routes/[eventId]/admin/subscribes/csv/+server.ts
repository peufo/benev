import { getSubscribes, type Subscribes } from '../getSubscribes'
import { prisma, permission } from '$lib/server'
import { getCSV, z } from 'fuma'
import dayjs from 'dayjs'
import { parseQuery } from 'fuma/server'

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})
	url.searchParams.set('all', 'true')
	const { subscribes } = await getSubscribes(event, url)
	const { locale, timeZone } = parseQuery(url, {
		locale: z.string().nullish(),
		timeZone: z.string().nullish(),
	})
	function toLocaleString(date: Date): string {
		if (!locale || !timeZone) return date.toJSON()
		try {
			return date.toLocaleString(locale, { timeZone })
		} catch (e) {
			return 'Error'
		}
	}
	const columns: Record<string, (subscribe: Subscribes) => string | number> = {
		member: (s) => `${s.member.firstName} ${s.member.lastName}`,
		memberEmail: (s) => s.member.email || '',
		memberPhone: (s) => s.member.phone || '',
		subscribeAt: (s) => toLocaleString(s.createdAt),
		team: (s) => s.period.team.name,
		shiftStart: (s) => toLocaleString(s.period.start),
		shiftEnd: (s) => toLocaleString(s.period.end),
		shiftMinutes: (s) => dayjs(s.period.end).diff(s.period.start, 'minutes'),
		shiftTags: (s) => s.period.tags.map((t) => t.name).join(', '),
		subscribeBy: (s) => (s.createdBy == 'leader' ? 'event' : 'member'),
		isAbsent: (s) => s.isAbsent.toString(),
		memberApproved: (s) => s.member.isValidedByEvent.toString(),
		memberActive: (s) => s.member.isValidedByUser.toString(),
		status: (s) => s.state,
		isForcedValidation: (s) => s.isForcedValidation.toString(),
	}
	const csv = getCSV(subscribes, columns)
	return new Response(csv, {
		headers: {
			'Content-type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="subscribes.csv"',
		},
	})
}

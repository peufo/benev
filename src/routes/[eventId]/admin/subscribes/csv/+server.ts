import { getSubscribes, type Subscribes } from '../getSubscribes'
import { prisma, permission } from '$lib/server'
import { getCSV } from 'fuma'

export const GET = async ({ url, locals, params: { eventId } }) => {
	await permission.leader(eventId, locals)
	const event = await prisma.event.findUniqueOrThrow({
		where: { id: eventId },
		include: { memberFields: true },
	})
	url.searchParams.set('all', 'true')
	const { subscribes } = await getSubscribes(event, url)
	const columns: Record<string, (subscribe: Subscribes) => string | number> = {
		member: (s) => `${s.member.user.firstName} ${s.member.user.lastName}`,
		memberEmail: (s) => s.member.user.email,
		memberPhone: (s) => s.member.user.phone || '',
		subscribeAt: (s) => s.createdAt.toJSON(),
		team: (s) => s.period.team.name,
		shiftStart: (s) => s.period.start.toJSON(),
		shiftEnd: (s) => s.period.end.toJSON(),
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

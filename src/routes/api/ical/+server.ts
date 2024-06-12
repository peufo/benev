import ical, { ICalCalendarMethod } from 'ical-generator'

export const GET = async ({ url }) => {
	const token = url.searchParams.get('token')
	console.log({ token })
	// Create and use user token

	const calendar = ical({ name: 'Mon bénévolat', method: ICalCalendarMethod.REFRESH })

	const startTime = new Date()
	const endTime = new Date()
	endTime.setHours(startTime.getHours() + 1)

	calendar.createEvent({
		start: startTime,
		end: endTime,
		summary: 'Secteur XY',
		description: 'It works ;)',
		location: 'my room',
		url: 'https://benev.io/me',
	})

	return new Response(calendar.toString(), {
		headers: {
			'Content-type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'attachment; filename="calendar.ics"',
		},
	})
}

import { page } from '$app/state'

export function getEventTimeZone(): string {
	const timeZone = page.data.event?.timezone || page.data.member?.event.timezone
	if (!timeZone) {
		throw new Error(
			'Timezone not found. Make sure page.data.event.timezone or page.data.member.event.timezone is set.'
		)
	}
	return timeZone
}

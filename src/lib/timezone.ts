import { get } from 'svelte/store'
import { page } from '$app/stores'

export function getEventTimeZone(): string {
	const timeZone = get(page).data.event?.timezone || get(page).data.member?.event.timezone
	if (!timeZone) {
		throw new Error(
			'Timezone not found. Make sure page.data.event.timezone or page.data.member.event.timezone is set.'
		)
	}
	return timeZone
}

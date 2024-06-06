import { derived, writable } from 'svelte/store'
import { page } from '$app/stores'

export * from './isMobile'

export const eventPath = derived(page, ({ params }) => (params.eventId ? `/${params.eventId}` : ''))

export const onlyAvailable = derived(
	page,
	({ url }) => url.searchParams.get('onlyAvailable') === 'true'
)

export const periodDrawerTransitionX = writable(0)

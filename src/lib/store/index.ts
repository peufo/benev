import { derived, writable } from 'svelte/store'
import { page } from '$app/stores'

export * from './isMobile'
export * from './ctrl'

export const eventPath = derived(page, ({ params }) => (params.eventId ? `/${params.eventId}` : ''))

export const periodDrawerTransitionX = writable(0)

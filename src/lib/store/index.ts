import { derived } from 'svelte/store'
import { page } from '$app/stores'

export const eventPath = derived(page, ({ params }) => (params.eventId ? `/${params.eventId}` : ''))

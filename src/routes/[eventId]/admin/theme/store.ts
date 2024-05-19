import { writable } from 'svelte/store'
import type { EventTheme } from '$lib/models'

export const theme = writable<EventTheme>({})

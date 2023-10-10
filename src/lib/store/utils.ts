import { browser } from '$app/environment'
import { jsonParse } from '$lib/jsonParse'
import { writable } from 'svelte/store'

export function sessionStore<T>(key: string, value: T) {
	if (!browser) return writable<T>(value)

	const initialValue = jsonParse<T>(sessionStorage.getItem(key), value)
	const store = writable<T>(initialValue)
	store.subscribe((newValue) => {
		sessionStorage.setItem(key, JSON.stringify(newValue))
	})
	return store
}

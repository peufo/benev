import { derived } from 'svelte/store'
import { page } from '$app/stores'

export const eventPath = derived(page, ({ params }) => (params.eventId ? `/${params.eventId}` : ''))
export const urlParam = derived(page, ({ url }) => {
	return {
		/** Return new url with new params */
		with: (params: Record<string, string>) => {
			const _url = new URL(url)
			Object.entries(params).forEach(([key, value]) => _url.searchParams.set(key, value))
			return _url.pathname + _url.search
		},
		/** Return new url without params keys provided */
		without: (...keys: string[]) => {
			const _url = new URL(url)
			keys.forEach((key) => _url.searchParams.delete(key))
			return _url.pathname + _url.search
		},
		/** Check if key exist in url params */
		has: (key: string) => url.searchParams.has(key),
		get: (key: string) => url.searchParams.get(key),
		/** Check if value match in url params */
		hasValue: (key: string, value: string) => url.searchParams.get(key) === value,
	}
})

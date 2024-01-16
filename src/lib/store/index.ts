import { derived } from 'svelte/store'
import { page } from '$app/stores'
import { sessionStore } from './utils'

export * from './isMobile'
export const eventPath = derived(page, ({ params }) => (params.eventId ? `/${params.eventId}` : ''))
export const display = sessionStore<'list' | 'table'>('display', 'list')
export const onlyAvailable = sessionStore('onlyAvailable', false)

export const param = derived(page, (_page) => {
	const { url } = _page

	/** Return new url with new params */
	const _with = (params: Record<string, string | number>, ...keysToRemove: string[]) => {
		const _url = new URL(url)
		Object.entries(params).forEach(([key, value]) => _url.searchParams.set(key, String(value)))
		keysToRemove.forEach((key) => url.searchParams.delete(key))
		return _url.search
	}

	/** Return new url without params keys provided */
	const without = (...keys: string[]) => {
		const _url = new URL(url)
		keys.forEach((key) => _url.searchParams.delete(key))
		return _url.search
	}

	/** Return new url with toggle params */
	const toggle = (params: Record<string, string>) => {
		const _url = new URL(url)
		Object.entries(params).forEach(([key, value]) => {
			if (url.searchParams.get(key) === value) _url.searchParams.delete(key)
			else _url.searchParams.set(key, value)
		})
		return _url.search
	}

	return {
		with: _with,
		without,
		toggle,
		/** Check if key exist in url params */
		has: (key: string) => url.searchParams.has(key),
		get: (key: string) => url.searchParams.get(key),
		/** Check if value match in url params */
		hasValue: (key: string, value: string) => url.searchParams.get(key) === value,
		page: _page,
	}
})

export const urlParam = derived(param, (_param) => {
	const { pathname } = _param.page.url
	/** Return new url with new params */
	const _with = (params: Record<string, string | number>, ...keysToRemove: string[]) => {
		return pathname + _param.with(params, ...keysToRemove)
	}

	/** Return new url without params keys provided */
	const without = (...keys: string[]) => {
		return pathname + _param.without(...keys)
	}

	/** Return new url with toggle params */
	const toggle = (params: Record<string, string>) => {
		return pathname + _param.toggle(params)
	}

	return {
		..._param,
		with: _with,
		without,
		toggle,
	}
})

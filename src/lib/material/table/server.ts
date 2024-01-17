import { redirect } from '@sveltejs/kit'
import { jsonParse } from '$lib/jsonParse'
import { createKeys } from '$lib/material/table/context'

export function ensureFieldsWithFilterIsVisible(
	tableKey: string,
	url: URL,
	isFilterKey: (key: string) => boolean
) {
	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_HIDDEN } = createKeys(tableKey)
	const fieldsVisible = jsonParse<string[]>(url.searchParams.get(KEY_FIELDS_VISIBLE), [])
	const fieldsHidden = jsonParse<string[]>(url.searchParams.get(KEY_FIELDS_HIDDEN), [])

	// Ensure all existing filter is visible
	const _fieldsVisible = [...fieldsVisible]
	for (const key in url.searchParams.keys()) {
		if (!isFilterKey(key)) continue
		if (!fieldsVisible.includes(key)) _fieldsVisible.push(key)
	}

	// Ensure a field is not visible and hidden in same time
	const _fieldsHidden = fieldsHidden.filter((field) => !fieldsVisible.includes(field))

	const paramsUpdated =
		_fieldsVisible.length !== fieldsVisible.length || _fieldsHidden.length !== fieldsHidden.length
	if (!paramsUpdated) return
	const _url = new URL(url)
	_url.searchParams.set(KEY_FIELDS_VISIBLE, JSON.stringify(_fieldsVisible))
	_url.searchParams.set(KEY_FIELDS_HIDDEN, JSON.stringify(_fieldsHidden))
	redirect(302, _url)
}

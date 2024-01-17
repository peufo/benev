import { redirect } from '@sveltejs/kit'
import { jsonParse } from '$lib/jsonParse'
import { createKeys } from '$lib/material/table/context'

export function ensureFieldsWithFilterAreVisibles(
	tableKey: string,
	url: URL,
	isFilterKey: (key: string) => boolean
) {
	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_HIDDEN } = createKeys(tableKey)
	const fieldsVisible = jsonParse<string[]>(url.searchParams.get(KEY_FIELDS_VISIBLE), [])
	const fieldsHidden = jsonParse<string[]>(url.searchParams.get(KEY_FIELDS_HIDDEN), [])

	// Ensure all existing filter is visible
	const _fieldsVisible = [...fieldsVisible]
	const _fieldsHidden = [...fieldsHidden]
	for (const key of url.searchParams.keys()) {
		if (!isFilterKey(key)) continue
		if (!_fieldsVisible.includes(key)) _fieldsVisible.push(key)
		if (_fieldsHidden.includes(key)) _fieldsHidden.splice(_fieldsHidden.indexOf(key), 1)
	}

	const paramsUpdated =
		_fieldsVisible.length !== fieldsVisible.length || _fieldsHidden.length !== fieldsHidden.length
	if (!paramsUpdated) return

	const _url = new URL(url)

	if (!_fieldsVisible.length) _url.searchParams.delete(KEY_FIELDS_VISIBLE)
	else _url.searchParams.set(KEY_FIELDS_VISIBLE, JSON.stringify(_fieldsVisible))

	if (!_fieldsHidden.length) _url.searchParams.delete(KEY_FIELDS_HIDDEN)
	else _url.searchParams.set(KEY_FIELDS_HIDDEN, JSON.stringify(_fieldsHidden))

	redirect(302, _url)
}

import { browser } from '$app/environment'
import type { ComponentAndProps, Primitive } from '$lib/utils'
import { jsonParse } from '$lib/jsonParse'
import { createKeys } from '.'
import { goto } from '$app/navigation'

export type TableField<Item = any> = {
	key: string
	label: string
	getCell: (item: Item) => ComponentAndProps | Primitive | Primitive[] | undefined
	hint?: string
	locked?: boolean
	visible?: boolean
	head?: ComponentAndProps | ((field: TableField) => ComponentAndProps)
}

/**
 * Initialise fields from url query
 */
export function createFieldsInit(tablekey: string, fields: TableField[]) {
	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_ORDER } = createKeys(tablekey)

	return (url: URL) => {
		const { searchParams } = url

		const fieldsVisibleDefault = fields.filter((f) => f.visible).map((f) => f.key)
		const fieldsVisible = jsonParse(searchParams.get(KEY_FIELDS_VISIBLE), fieldsVisibleDefault)
		const fieldsOrderDefault = fields.map((f) => f.key)
		const fieldsOrder = jsonParse(searchParams.get(KEY_FIELDS_ORDER), fieldsOrderDefault)

		// Init correct visible prop
		fields.forEach((field) => {
			field.visible = fieldsVisible.includes(field.key)
		})

		// Init correct order fields
		if (fieldsOrder.length === fields.length) {
			fields = fields.map((f, index, self) => {
				const key = fieldsOrder[index]
				const field = self.find((_) => _.key === key)
				return field ? field : f
			})
		}

		ensureDontHaveFilterHidden(url, fields)

		return fields
	}
}

function ensureDontHaveFilterHidden(url: URL, fields: TableField[]) {
	if (!browser) return

	function urlWithout(...keys: string[]) {
		const _url = new URL(url)
		keys.forEach((key) => _url.searchParams.delete(key))
		return _url
	}
	let withoutKeys = fields
		.filter((field) => !field.locked && !field.visible && url.searchParams.has(field.key))
		.map((field) => field.key)
	if (withoutKeys.length) goto(urlWithout(...withoutKeys), { replaceState: true, noScroll: true })
}

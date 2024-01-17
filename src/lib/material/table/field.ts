import { page } from '$app/stores'
import { get } from 'svelte/store'
import type { ComponentAndProps, Primitive } from '$lib/utils'
import { jsonParse } from '$lib/jsonParse'
import { createKeys } from '$lib/material/table/context'

export type TableField<Item = any> = {
	key: string
	label: string
	getCell: (item: Item) => ComponentAndProps | Primitive | Primitive[] | undefined
	hint?: string
	locked?: boolean
	visible?: boolean
	head?: ComponentAndProps | ((field: TableField) => ComponentAndProps)
	/** Internal usage */
	$visible?: boolean
}

/**
 * Initialise fields from url query
 */
export function initFields(tablekey: string, fields: TableField[]) {
	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_HIDDEN, KEY_FIELDS_ORDER } = createKeys(tablekey)
	const {
		url: { searchParams },
	} = get(page)

	const fieldsVisibleDefault = fields.filter((f) => f.locked || f.visible).map((f) => f.key)
	const fieldsVisible = jsonParse(searchParams.get(KEY_FIELDS_VISIBLE), fieldsVisibleDefault)
	const fieldsHiddenDefault = fields.filter((f) => !f.locked && !f.visible).map((f) => f.key)
	const fieldsHidden = jsonParse(searchParams.get(KEY_FIELDS_HIDDEN), fieldsHiddenDefault)
	const fieldsOrderDefault = fields.map((f) => f.key)
	const fieldsOrder = jsonParse(searchParams.get(KEY_FIELDS_ORDER), fieldsOrderDefault)

	// Init correct visible prop
	const _fields = fields.map((field) => ({
		...field,
		$visible: fieldsVisible.includes(field.key) && !fieldsHidden.includes(field.key),
	}))

	// Init correct order fields
	if (fieldsOrder.length === fields.length) {
		return _fields.map((f, index, self) => {
			const key = fieldsOrder[index]
			const field = self.find((_) => _.key === key)
			return field ? field : f
		})
	}

	return _fields
}

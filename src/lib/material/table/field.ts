import { page } from '$app/stores'
import { get } from 'svelte/store'
import type { ComponentAndProps, Primitive } from '$lib/utils'
import type { FieldType } from '@prisma/client'
import { jsonParse } from '$lib/jsonParse'
import { createKeys } from '$lib/material/table/context'

// TODO: add FieldType "date" ?
export type TableFieldType = FieldType | 'date'

export type TableField<Item = any> = {
	key: string
	label: string
	getCell: (item: Item) => ComponentAndProps | Primitive | Primitive[] | undefined
	hint?: string
	locked?: boolean
	visible?: boolean
	/** TODO: use directly "type" */
	head?: ComponentAndProps | ((field: TableField) => ComponentAndProps)
	/** Internal usage */
	$visible?: boolean
}

/**
 * Initialise fields from url query
 */
export function syncFieldsWithParams(tablekey: string, fields: TableField[]) {
	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_HIDDEN, KEY_FIELDS_ORDER } = createKeys(tablekey)
	const {
		url: { searchParams },
	} = get(page)

	const fieldsVisible = jsonParse<string[]>(searchParams.get(KEY_FIELDS_VISIBLE), [])
	const fieldsHidden = jsonParse<string[]>(searchParams.get(KEY_FIELDS_HIDDEN), [])
	const fieldsOrder = jsonParse(searchParams.get(KEY_FIELDS_ORDER), [])

	// Init correct visible prop
	const _fields = fields.map((field) => ({
		...field,
		$visible:
			field.locked ||
			(field.visible ? !fieldsHidden.includes(field.key) : fieldsVisible.includes(field.key)),
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

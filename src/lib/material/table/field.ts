import { page } from '$app/stores'
import { get } from 'svelte/store'
import type { ComponentAndProps, Primitive } from '$lib/utils'
import type { FieldType } from '@prisma/client'
import { jsonParse } from '$lib/jsonParse'
import { createKeys } from '$lib/material/table/context'
import type { Options } from 'fuma'

export type TableFieldType = FieldType | 'date'

export type TableField<Item = any> = TableFieldCommon &
	(
		| TableFieldUntyped<Item>
		| TableFieldPrimitive<Item>
		| TableFieldSelect<Item>
		| TableFieldMultiselect<Item>
	)

type TableFieldCommon = {
	key: string
	label: string
	type?: TableFieldType
	options?: Options
	hint?: string
	locked?: boolean
	visible?: boolean
	/** Internal usage */
	$visible?: boolean
}

type TableFieldUntyped<Item = any> = {
	getCell: (item: Item) => ComponentAndProps | Primitive[] | Primitive | undefined
	head?: ComponentAndProps | ((field: TableField) => ComponentAndProps)
}

type TableFieldPrimitive<Item = any> = {
	type: Exclude<TableFieldType, 'select' | 'multiselect'>
	getCell: (item: Item) => ComponentAndProps | Primitive | undefined
}

type TableFieldSelect<Item = any> = {
	type: 'select'
	getCell: (item: Item) => Primitive
	options: Options
}
type TableFieldMultiselect<Item = any> = {
	type: 'multiselect'
	getCell: (item: Item) => Primitive[]
	options: Options
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

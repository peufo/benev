import { page } from '$app/stores'
import { get } from 'svelte/store'
import type { ComponentAndProps, Primitive } from '$lib/fuma/utils/component.js'
import { jsonParse } from '$lib/fuma/utils/jsonParse.js'
import type { Options } from '$lib/fuma/utils/options.js'
import { createKeys } from '$lib/fuma/ui/table/context.js'

export type ItemBase = { id: string }

export type TableFieldType =
	'string' | 'textarea' | 'number' | 'boolean' | 'select' | 'multiselect' | 'date'

export type TableField<Item extends ItemBase> = TableFieldCommon &
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
	sortable?: boolean
	/** Internal usage */
	_visible?: boolean
}

type TableFieldUntyped<Item extends ItemBase> = {
	getCell: (
		item: Item
	) => ComponentAndProps[] | ComponentAndProps | Primitive[] | Primitive | undefined | null
	head?: ComponentAndProps | ((field: TableField<Item>) => ComponentAndProps)
}

type TableFieldPrimitive<Item extends ItemBase> = {
	type: Exclude<TableFieldType, 'select' | 'multiselect'>
	getCell: (item: Item) => ComponentAndProps[] | ComponentAndProps | Primitive | undefined | null
}

type TableFieldSelect<Item extends ItemBase> = {
	type: 'select'
	getCell: (item: Item) => Primitive | undefined | null
	options: Options
}
type TableFieldMultiselect<Item extends ItemBase> = {
	type: 'multiselect'
	getCell: (item: Item) => Primitive[] | undefined | null
	options: Options
}

/**
 * Initialise fields from url query
 */
export function syncFieldsWithParams<Item extends ItemBase>(
	tablekey: string,
	fields: TableField<Item>[]
) {
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
		_visible:
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

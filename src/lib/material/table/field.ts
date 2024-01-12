import type { ComponentAndProps, Primitive } from '$lib/utils'

export type TableField<Item = any> = {
	key: string
	label: string
	getCell: (item: Item) => ComponentAndProps | Primitive | Primitive[]
	hint?: string
	locked?: boolean
	visible?: boolean
	head?: ComponentAndProps | ((field: TableField) => ComponentAndProps)
}

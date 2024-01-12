import type { ComponentAndProps, Primitive } from '$lib/utils'
import type { FieldType } from '@prisma/client'

export type Cell = ComponentAndProps | Primitive | Primitive[]

export type TableField<Item = any> = {
	key: string
	label: string
	getCell: (item: Item) => Cell
	hint?: string
	locked?: boolean
	visible?: boolean
	head?: FieldType | ComponentAndProps | ((field: TableField<Item>) => ComponentAndProps)
}

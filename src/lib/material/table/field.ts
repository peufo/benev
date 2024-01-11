import type { ComponentAndProps, Primitive } from '$lib/utils'

export type Cell = ComponentAndProps | Primitive | Primitive[]

export type TableField<Item> = {
	key: string
	label: string
	getCell: (item: Item) => Cell
	hint?: string
	/** Can't be hiden or reorded */
	locked?: boolean
	visible?: boolean
}

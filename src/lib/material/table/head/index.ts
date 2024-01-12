import type { ComponentAndProps, Primitive } from '$lib/utils'
import type { FieldType } from '@prisma/client'
import type { ComponentProps, ComponentType } from 'svelte'

import { default as TableHeadBoolean } from './TableHeadBoolean.svelte'
import { default as TableHeadSelect } from './TableHeadSelect.svelte'
import { default as TableHeadDate } from './TableHeadDate.svelte'
import { default as TableHeadDefault } from './TableHeadDefault.svelte'
import { default as TableHeadNumber } from './TableHeadNumber.svelte'
import { default as TableHeadString } from './TableHeadString.svelte'

export type Cell = ComponentAndProps | Primitive | Primitive[]

export type TableField<Item = any> = {
	key: string
	label: string
	getCell: (item: Item) => Cell
	hint?: string
	locked?: boolean
	visible?: boolean
	head?: ComponentAndProps | ((field: TableField) => ComponentAndProps)
}

const tableHeadComponentRecord = {
	boolean: TableHeadBoolean,
	string: TableHeadBoolean,
	textarea: TableHeadBoolean,
	number: TableHeadBoolean,
	multiselect: TableHeadSelect,
	select: TableHeadSelect,
	date: TableHeadDate,
} satisfies Record<FieldType | 'date', ComponentType>
// TODO: add FieldType "date"

export function tableheadComponent<T extends FieldType>(
	type: T,
	props: Omit<ComponentProps<InstanceType<(typeof tableHeadComponentRecord)[T]>>, 'field'>
): (field: TableField) => ComponentAndProps {
	return (field: TableField) => {
		const component = tableHeadComponentRecord[type]
		if (type !== 'multiselect') return { component, props: { ...props, field } }
		return { component, props: { ...props, field, multiSelect: true } }
	}
}

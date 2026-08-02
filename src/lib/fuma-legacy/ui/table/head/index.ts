import type { ComponentProps } from 'svelte'

import type { AnyComponent, ComponentAndProps } from '$lib/ui/component.js'
import type { ItemBase, TableField, TableFieldType } from '$lib/fuma-legacy/ui/table/field.js'
import { default as TableHeadSelect } from '$lib/fuma-legacy/ui/table/head/TableHeadSelect.svelte'
import { default as TableHeadDate } from '$lib/fuma-legacy/ui/table/head/TableHeadDate.svelte'
import { default as TableHeadBoolean } from '$lib/fuma-legacy/ui/table/head/TableHeadBoolean.svelte'
import { default as TableHeadNumber } from '$lib/fuma-legacy/ui/table/head/TableHeadNumber.svelte'
import { default as TableHeadString } from '$lib/fuma-legacy/ui/table/head/TableHeadString.svelte'

const tableHeadComponentRecord = {
	boolean: TableHeadBoolean,
	string: TableHeadString,
	textarea: TableHeadString,
	number: TableHeadNumber,
	multiselect: TableHeadSelect,
	select: TableHeadSelect,
	date: TableHeadDate,
} satisfies Record<TableFieldType, AnyComponent>

export function tableHeadComponent<T extends TableFieldType>(
	type: T,
	props: Omit<ComponentProps<(typeof tableHeadComponentRecord)[T]>, 'field'>
): <Item extends ItemBase>(field: TableField<Item>) => ComponentAndProps {
	return (field) => {
		const component = tableHeadComponentRecord[type]
		if (type !== 'multiselect') return { component, props: { ...props, field } }
		return { component, props: { ...props, field, multiSelect: true } }
	}
}

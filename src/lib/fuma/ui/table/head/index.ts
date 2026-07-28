import type { ComponentProps, ComponentType } from 'svelte'

import type { ComponentAndProps } from '$lib/fuma/utils/component.js'
import type { ItemBase, TableField, TableFieldType } from '$lib/fuma/ui/table/field.js'
import { default as TableHeadSelect } from '$lib/fuma/ui/table/head/TableHeadSelect.svelte'
import { default as TableHeadDate } from '$lib/fuma/ui/table/head/TableHeadDate.svelte'
import { default as TableHeadBoolean } from '$lib/fuma/ui/table/head/TableHeadBoolean.svelte'
import { default as TableHeadNumber } from '$lib/fuma/ui/table/head/TableHeadNumber.svelte'
import { default as TableHeadString } from '$lib/fuma/ui/table/head/TableHeadString.svelte'

const tableHeadComponentRecord = {
	boolean: TableHeadBoolean,
	string: TableHeadString,
	textarea: TableHeadString,
	number: TableHeadNumber,
	multiselect: TableHeadSelect,
	select: TableHeadSelect,
	date: TableHeadDate,
} satisfies Record<TableFieldType, ComponentType>

export function tableHeadComponent<T extends TableFieldType>(
	type: T,
	props: Omit<ComponentProps<InstanceType<(typeof tableHeadComponentRecord)[T]>>, 'field'>
): <Item extends ItemBase>(field: TableField<Item>) => ComponentAndProps {
	return (field) => {
		const component = tableHeadComponentRecord[type]
		if (type !== 'multiselect') return { component, props: { ...props, field } }
		return { component, props: { ...props, field, multiSelect: true } }
	}
}

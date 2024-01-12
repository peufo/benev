import type { ComponentAndProps, Primitive } from '$lib/utils'
import type { FieldType } from '@prisma/client'
import type { ComponentProps, ComponentType } from 'svelte'
import type { TableField } from '../field'

import { default as TableHeadSelect } from './TableHeadSelect.svelte'
import { default as TableHeadDate } from './TableHeadDate.svelte'
import { default as TableHeadDefault } from './TableHeadDefault.svelte'
// TODO:
import { default as TableHeadBoolean } from './TableHeadBoolean.svelte'
import { default as TableHeadNumber } from './TableHeadNumber.svelte'
import { default as TableHeadString } from './TableHeadString.svelte'

// TODO: add FieldType "date" ?
type _FieldType = FieldType | 'date'

const tableHeadComponentRecord = {
	boolean: TableHeadDefault,
	string: TableHeadDefault,
	textarea: TableHeadDefault,
	number: TableHeadDefault,
	multiselect: TableHeadSelect,
	select: TableHeadSelect,
	date: TableHeadDate,
} satisfies Record<_FieldType, ComponentType>

export function tableheadComponent<T extends _FieldType>(
	type: T,
	props: Omit<ComponentProps<InstanceType<(typeof tableHeadComponentRecord)[T]>>, 'field'>
): (field: TableField) => ComponentAndProps {
	return (field: TableField) => {
		const component = tableHeadComponentRecord[type]
		if (type !== 'multiselect') return { component, props: { ...props, field } }
		return { component, props: { ...props, field, multiSelect: true } }
	}
}

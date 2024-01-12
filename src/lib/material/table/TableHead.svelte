<script lang="ts">
	import TableHeadDefault from './head/TableHeadDefault.svelte'

	import type { ComponentType } from 'svelte'

	import { component, type ComponentAndProps } from '$lib/utils'

	import { type TableField, TableFieldsSelect } from '$lib/material/table'
	import { TableHeadBoolean, TableHeadSelect } from '$lib/material/table/head'
	import type { FieldType } from '@prisma/client'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]

	const tableHeadComponents: Record<FieldType, ComponentType> = {
		boolean: TableHeadBoolean,
		string: TableHeadBoolean,
		textarea: TableHeadBoolean,
		number: TableHeadBoolean,
		select: TableHeadSelect,
		multiselect: TableHeadBoolean,
	}

	function getHeadComponent(field: TableField): ComponentAndProps {
		if (!field.head) return component(TableHeadDefault, { field })
		if (typeof field.head === 'string') return component(tableHeadComponents[field.head], { field })
		if (typeof field.head === 'function') return field.head(field)
		return field.head
	}
</script>

<thead>
	<tr class="shadow">
		{#each fields.filter((f) => f.locked || f.visible) as field (field.key)}
			{@const { component, props } = getHeadComponent(field)}
			<svelte:component this={component} {...props} {field} />
		{/each}
		<TableFieldsSelect bind:fields />
	</tr>
</thead>

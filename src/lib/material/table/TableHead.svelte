<script lang="ts">
	import TableHeadDefault from './head/TableHeadDefault.svelte'
	import { component, type ComponentAndProps } from '$lib/utils'
	import { type TableField, TableFieldsSelect } from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]

	function getComponent(field: TableField): ComponentAndProps {
		if (!field.head) return component(TableHeadDefault, { field })
		if (typeof field.head === 'function') return field.head(field)
		return field.head
	}
</script>

<thead>
	<tr class="shadow">
		{#each fields.filter((f) => f.locked || f.visible) as field (field.key)}
			{@const { component, props } = getComponent(field)}
			<svelte:component this={component} {...props} />
		{/each}
		<TableFieldsSelect bind:fields />
	</tr>
</thead>

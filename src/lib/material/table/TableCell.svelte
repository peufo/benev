<script lang="ts">
	import {
		TableCellArray,
		TableCellBoolean,
		TableCellNumber,
		TableCellString,
	} from '$lib/material/table/cell'

	import type { TableField } from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let item: Item
	export let field: TableField<Item>

	$: value = field.getCell(item)
</script>

{#if Array.isArray(value)}
	<TableCellArray {value} />
{:else if typeof value === 'number'}
	<TableCellNumber {value} />
{:else if typeof value === 'boolean'}
	<TableCellBoolean {value} />
{:else if typeof value === 'string'}
	<TableCellString {value} {field} />
{:else if value === undefined}
	<td>-</td>
{:else}
	<td>
		<svelte:component this={value.component} {...value.props} />
	</td>
{/if}

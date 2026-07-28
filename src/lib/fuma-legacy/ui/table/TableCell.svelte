<script lang="ts" generics="Item extends {id: string}">
	import {
		TableCellArray,
		TableCellBoolean,
		TableCellNumber,
		TableCellString,
	} from '$lib/fuma-legacy/ui/table/cell/index.js'
	import type { TableField } from '$lib/fuma-legacy/ui/table/index.js'

	interface Props {
		item: Item
		field: TableField<Item>
	}

	let { item, field }: Props = $props()

	let value = $derived(field.getCell(item))
</script>

{#if Array.isArray(value)}
	<TableCellArray {value} />
{:else if typeof value === 'number'}
	<TableCellNumber {value} />
{:else if typeof value === 'boolean'}
	<TableCellBoolean {value} />
{:else if typeof value === 'string'}
	<TableCellString {value} {field} />
{:else if value === undefined || value === null}
	<td>-</td>
{:else}
	<td>
		<value.component {...value.props} />
	</td>
{/if}

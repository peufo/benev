<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { TableCell, type TableField } from '$lib/material'
	import type { ComponentAndProps } from '$lib/utils'

	type Item = $$Generic<{ id: string }>
	export let items: Item[]
	export let fields: TableField<Item>[]
	export let action: ((item: Item) => ComponentAndProps) | undefined = undefined
	export let classRow = ''

	const dispatch = createEventDispatcher<{ click: Item }>()

	$: _fields = fields.filter((f) => f.$visible)

	function handleClickRow(event: MouseEvent, item: Item) {
		dispatch('click', item)
	}
</script>

<tbody>
	{#each items as item (item.id)}
		<tr class={classRow} on:click={(event) => handleClickRow(event, item)}>
			{#each _fields as field (field.key)}
				<TableCell {item} {field} />
			{/each}
			<td align="right">
				{#if action}
					{@const { component, props } = action(item)}
					<svelte:component this={component} {...props} />
				{/if}
			</td>
		</tr>
	{/each}
</tbody>

<script lang="ts" generics="Item extends {id: string}">
	import { TableCell, type TableField } from '$lib/fuma-legacy/ui/table/index.js'
	import type { ComponentAndProps } from '$lib/ui/component.js'

	interface Props {
		items: Item[]
		fields: TableField<Item>[]
		action?: ((item: Item) => ComponentAndProps) | undefined
		classRow?: string
		/** Remplacent les évènements de la version Svelte 4. */
		onclick?: (value: Item) => void
	}

	let { items, fields, action = undefined, classRow = '', onclick }: Props = $props()

	let _fields = $derived(fields.filter((f) => f._visible))

	function handleClickRow(event: MouseEvent, item: Item) {
		onclick?.(item)
	}
</script>

<tbody>
	{#each items as item (item.id)}
		<tr class={classRow} onclick={(event) => handleClickRow(event, item)}>
			{#each _fields as field (field.key)}
				<TableCell {item} {field} />
			{/each}
			<td align="right">
				{#if action}
					{@const { component, props } = action(item)}
					{@const SvelteComponent = component}
					<SvelteComponent {...props} />
				{/if}
			</td>
		</tr>
	{/each}
</tbody>

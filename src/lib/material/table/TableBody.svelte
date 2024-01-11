<script lang="ts">
	import { TableCell } from '$lib/material'

	import type { TableField } from '$lib/material'
	type Item = $$Generic<{ id: string }>
	export let items: Item[]
	export let fields: TableField<Item>[]

	$: _fields = fields.filter((f) => f.locked || f.visible)
</script>

<tbody>
	{#each items as item (item.id)}
		<tr>
			{#each _fields as field}
				<TableCell {item} {field} />
			{/each}
		</tr>
	{/each}
</tbody>

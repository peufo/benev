<script lang="ts">
	import { Placeholder } from '$lib/material'
	import type { ComponentAndProps } from '$lib/utils'

	import { type TableField, TableHead, TableBody } from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]
	export let items: Item[]
	export let action: ((item: Item) => ComponentAndProps) | undefined = undefined
	export let placholder = 'Aucun élément trouvé'
	export let classRow = ''
</script>

<div class="overflow-x-auto min-h-[320px] border rounded-lg">
	{#if items.length}
		<table class="table relative">
			<TableHead bind:fields />
			<TableBody {fields} {items} {action} {classRow} on:click />
		</table>
	{:else}
		<Placeholder>{placholder}</Placeholder>
	{/if}
</div>

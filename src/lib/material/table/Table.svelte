<script lang="ts">
	import { Placeholder } from '$lib/material'

	import { type TableField, TableHead, TableBody } from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]
	export let items: Item[]
</script>

<div class="overflow-x-auto min-h-[320px] border rounded-lg">
	{#if items.length}
		<table class="table relative">
			<TableHead {fields} />
			<TableBody {fields} {items} />
		</table>
	{:else}
		<Placeholder>Aucun membre trouvé</Placeholder>
	{/if}
</div>

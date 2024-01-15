<script lang="ts">
	import { Placeholder } from '$lib/material'
	import type { ComponentAndProps } from '$lib/utils'
	import { page } from '$app/stores'

	import {
		type TableField,
		TableHead,
		TableBody,
		context,
		createKeys,
		createFieldsInit,
	} from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]
	export let items: Item[]
	export let action: ((item: Item) => ComponentAndProps) | undefined = undefined
	export let placholder = 'Aucun élément trouvé'
	export let classRow = ''
	export let key = 'table'

	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_ORDER } = createKeys(key)
	context.set(key, {
		KEY_FIELDS_VISIBLE,
		KEY_FIELDS_ORDER,
	})

	const fieldsInit = createFieldsInit(key, fields)
	fields = fieldsInit($page.url)
</script>

<div class="overflow-x-auto min-h-[320px] border rounded-lg">
	{#if items.length}
		<table class="table relative">
			<TableHead bind:fields {key} />
			<TableBody {fields} {items} {action} {classRow} on:click />
		</table>
	{:else}
		<table class="table relative">
			<TableHead {fields} {key} />
		</table>
		<Placeholder class="rounded-t-none">
			{placholder}
		</Placeholder>
	{/if}
</div>

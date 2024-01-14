<script lang="ts">
	import { urlParam } from '$lib/store'
	import { jsonParse } from '$lib/jsonParse'
	import { Placeholder } from '$lib/material'
	import type { ComponentAndProps } from '$lib/utils'

	import { type TableField, TableHead, TableBody, context } from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let fields: TableField<Item>[]
	export let items: Item[]
	export let action: ((item: Item) => ComponentAndProps) | undefined = undefined
	export let placholder = 'Aucun élément trouvé'
	export let classRow = ''
	export let key = 'table'

	const KEY_FIELDS_VISIBLE = `${key}.fields.visible`
	const KEY_FIELDS_ORDER = `${key}fields.order`
	context.set(key, {
		KEY_FIELDS_VISIBLE,
		KEY_FIELDS_ORDER,
	})

	const fieldsVisibleDefault = fields.filter((f) => f.visible).map((f) => f.key)
	$: fieldsVisible = jsonParse($urlParam.get(KEY_FIELDS_VISIBLE), fieldsVisibleDefault)
	$: console.log({ fieldsVisible })
</script>

<div class="overflow-x-auto min-h-[320px] border rounded-lg">
	{#if items.length}
		<table class="table relative">
			<TableHead {fields} {fieldsVisible} {key} />
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

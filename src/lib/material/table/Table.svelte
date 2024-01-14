<script lang="ts">
	import { jsonParse } from '$lib/jsonParse'
	import { Placeholder } from '$lib/material'
	import type { ComponentAndProps } from '$lib/utils'
	import { page } from '$app/stores'

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
	const params = $page.url.searchParams
	if (params.has(KEY_FIELDS_VISIBLE)) {
		const fieldsVisible = jsonParse(params.get(KEY_FIELDS_VISIBLE), fieldsVisibleDefault)
		fields = fields.map((field) => ({
			...field,
			visible: fieldsVisible.includes(field.key),
		}))
	}
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

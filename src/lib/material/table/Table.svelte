<script lang="ts">
	import { afterNavigate } from '$app/navigation'
	import { Placeholder } from '$lib/material'
	import type { ComponentAndProps } from '$lib/utils'

	import {
		type TableField,
		TableHead,
		TableBody,
		context,
		createKeys,
		syncFieldsWithParams,
	} from '$lib/material/table'

	type Item = $$Generic<{ id: string }>
	export let key = 'table'
	export let fields: TableField<Item>[]
	export let items: Item[]
	export let action: ((item: Item) => ComponentAndProps) | undefined = undefined
	export let placholder = 'Aucun élément trouvé'
	export let classRow = ''
	export let hideBody = false
	export let onCreateField: (() => void) | undefined = undefined

	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_HIDDEN, KEY_FIELDS_ORDER } = createKeys(key)
	context.set(key, {
		KEY_FIELDS_VISIBLE,
		KEY_FIELDS_HIDDEN,
		KEY_FIELDS_ORDER,
	})

	const initFields = () => (fields = syncFieldsWithParams(key, fields))
	initFields()
	afterNavigate(initFields)
</script>

<div class="overflow-x-auto border rounded-lg bg-base-100" class:min-h-[320px]={!hideBody}>
	<table class="table relative">
		<TableHead {fields} {key} {onCreateField} />
		{#if !hideBody && items.length}
			<TableBody {fields} {items} {action} {classRow} on:click />
		{/if}
	</table>

	{#if hideBody && !items.length}
		<Placeholder class="rounded-t-none">
			{placholder}
		</Placeholder>
	{/if}
</div>

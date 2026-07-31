<script lang="ts" generics="Item extends {id: string}">
	import { untrack } from 'svelte'
	import { afterNavigate } from '$app/navigation'
	import { Placeholder } from '$lib/fuma-legacy/ui/placeholder/index.js'
	import type { ComponentAndProps } from '$lib/fuma-legacy/utils/component.js'

	import {
		type TableField,
		TableHead,
		TableBody,
		context,
		createKeys,
		syncFieldsWithParams,
	} from '$lib/fuma-legacy/ui/table/index.js'

	interface Props {
		key?: string
		fields: TableField<Item>[]
		items: Item[]
		slotAction?: ((item: Item) => ComponentAndProps) | undefined
		placholder?: string
		class?: string
		classRow?: string
		hideBody?: boolean
		onCreateField?: (() => void) | undefined
		/** Remplacent les évènements de la version Svelte 4. */
		onclick?: (value: Item) => void
	}

	let {
		key = 'table',
		fields = $bindable(),
		items,
		slotAction = undefined,
		placholder = 'Aucun élément trouvé',
		class: klass = '',
		classRow = '',
		hideBody = false,
		onCreateField = undefined,
		onclick,
	}: Props = $props()

	// `key` identifie la table pour toute sa durée de vie: le contexte est posé une fois.
	const { KEY_FIELDS_VISIBLE, KEY_FIELDS_HIDDEN, KEY_FIELDS_ORDER } = createKeys(untrack(() => key))
	context.set(
		untrack(() => key),
		{
			KEY_FIELDS_VISIBLE,
			KEY_FIELDS_HIDDEN,
			KEY_FIELDS_ORDER,
		}
	)

	const initFields = () => (fields = syncFieldsWithParams(key, fields))
	initFields()
	afterNavigate(initFields)
</script>

<div class="{klass} overflow-x-auto rounded-lg border bg-base-100" class:min-h-[320px]={!hideBody}>
	<table class="table relative">
		<TableHead {fields} {key} {onCreateField} />
		{#if !hideBody && items.length}
			<TableBody {fields} {items} action={slotAction} {classRow} {onclick} />
		{/if}
	</table>

	{#if hideBody && !items.length}
		<Placeholder class="rounded-t-none">
			{placholder}
		</Placeholder>
	{/if}
</div>

<script lang="ts">
	import { untrack } from 'svelte'
	import { InputBoolean, Placeholder, type ComponentAndProps } from '$lib/fuma-legacy'

	type Item = $$Generic<{ id: string }>
	interface Props {
		items: Item[]
		key: string
		placeholder: string
		legend: string
		labelAll: string
		getLabel: (item: Item) => string | ComponentAndProps
		class?: string
		children?: import('svelte').Snippet
	}

	let {
		items,
		key,
		placeholder,
		legend,
		labelAll,
		getLabel,
		class: klass = '',
		children,
	}: Props = $props()

	function mapSelected(arr: Item[], selected = true): (Item & { selected: boolean })[] {
		return arr.map((el) => ({ ...el, selected }))
	}
	function getJsonIds(arr: { id: string; selected: boolean }[]): string {
		return JSON.stringify(arr.filter((el) => el.selected).map((el) => el.id))
	}
	let _items = $state(mapSelected(untrack(() => items)))
</script>

<input type="hidden" name={key} value={getJsonIds(_items)} />

<fieldset class="p-2 rounded border border-base-300 {klass}">
	<legend class="px-2">{legend}</legend>
	<div class="flex gap-4 flex-wrap items-center">
		<InputBoolean
			key="{key}_all"
			value={_items.filter((p) => p.selected).length === items.length}
			onchange={(selected) => (_items = mapSelected(_items, selected))}
			label={labelAll}
			labelPosition="right"
		/>
		{@render children?.()}
	</div>
	<div class="divider"></div>
	{#each _items as item (item.id)}
		<InputBoolean
			key="{key}_{item.id}"
			bind:value={item.selected}
			label={getLabel(item)}
			labelPosition="right"
		/>
	{:else}
		<Placeholder>{placeholder}</Placeholder>
	{/each}
</fieldset>

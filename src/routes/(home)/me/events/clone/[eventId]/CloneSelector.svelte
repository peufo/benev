<script lang="ts">
	import { InputBoolean, Placeholder, USE_COERCE_JSON, type ComponentAndProps } from 'fuma'

	type Item = $$Generic<{ id: string }>
	export let items: Item[]
	export let key: string
	export let placeholder: string
	export let legend: string
	export let labelAll: string
	export let getLabel: (item: Item) => string | ComponentAndProps
	let klass = ''
	export { klass as class }

	function mapSelected(arr: Item[], selected = true): (Item & { selected: boolean })[] {
		return arr.map((el) => ({ ...el, selected }))
	}
	function getJsonIds(arr: { id: string; selected: boolean }[]): string {
		return JSON.stringify(arr.filter((el) => el.selected).map((el) => el.id))
	}
	let _items = mapSelected(items)
</script>

<input type="hidden" name={key} value={getJsonIds(_items)} />

<fieldset style="border: 1px solid #bbb" class="p-2 rounded {klass}">
	<legend class="px-2">{legend}</legend>
	<div class="flex gap-4 flex-wrap items-center">
		<InputBoolean
			key="{key}_all"
			value={_items.filter((p) => p.selected).length === items.length}
			on:change={({ detail: selected }) => (_items = mapSelected(_items, selected))}
			label={labelAll}
			labelPosition="right"
		/>
		<slot />
	</div>
	<div class="divider" />
	{#each _items as item}
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

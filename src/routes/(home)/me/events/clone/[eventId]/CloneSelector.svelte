<script lang="ts" generics="Item extends { id: string }">
	import type { Snippet } from 'svelte'
	import { untrack } from 'svelte'
	import { Placeholder } from '$lib/ui'

	interface Props {
		items: Item[]
		key: string
		placeholder: string
		legend: string
		labelAll: string
		label: Snippet<[Item]>
		class?: string
		children?: Snippet
	}

	let {
		items,
		key,
		placeholder,
		legend,
		labelAll,
		label,
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
	let allSelected = $derived(_items.every((item) => item.selected))
</script>

<!-- Seul ce champ est soumis: les cases ci-dessous ne servent qu'à le composer. -->
<input type="hidden" name={key} value={getJsonIds(_items)} />

<fieldset class="p-2 rounded border border-base-300 {klass}">
	<legend class="px-2">{legend}</legend>
	<div class="flex gap-4 flex-wrap items-center">
		<label class="flex items-center gap-2 cursor-pointer">
			<input
				type="checkbox"
				class="checkbox"
				checked={allSelected}
				onchange={({ currentTarget: { checked } }) => (_items = mapSelected(_items, checked))}
			/>
			<span>{labelAll}</span>
		</label>
		{@render children?.()}
	</div>
	<div class="divider"></div>
	{#each _items as item (item.id)}
		<label class="flex items-center gap-2 cursor-pointer">
			<input type="checkbox" class="checkbox" bind:checked={item.selected} />
			{@render label(item)}
		</label>
	{:else}
		<Placeholder>{placeholder}</Placeholder>
	{/each}
</fieldset>

<script lang="ts" generics="Item extends { id: string }">
	import type { Component, Snippet } from 'svelte'
	import { untrack } from 'svelte'
	import type { IconProps } from '@lucide/svelte'
	import { InputBoolean } from 'fuma'
	import type { RemoteFormField } from '$app/server'
	import { Placeholder, Section } from '#lib/ui/index.js'

	interface Props {
		items: Item[]
		/** Champ du formulaire qui porte les ids retenus, sérialisés en JSON. */
		field: RemoteFormField<string>
		/** Suffixe de l'ancre de la section. */
		key: string
		title: string
		icon: Component<IconProps>
		subtitle?: string
		placeholder: string
		labelAll: string
		getLabel: (item: Item) => string
		/** Rendu à droite du libellé de chaque case. */
		append?: Snippet<[Item]>
		children?: Snippet
	}

	let {
		items,
		field,
		key,
		title,
		icon,
		subtitle,
		placeholder,
		labelAll,
		getLabel,
		append,
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

<!-- Seul ce champ est soumis: les cases, sans `field`, n'ont pas de `name` et ne servent qu'à le
     composer. -->
<input {...field.as('hidden', getJsonIds(_items))} />

<Section id="clone-{key}" {title} {icon} {subtitle}>
	{@render children?.()}

	{#if _items.length}
		<InputBoolean
			variant="switch"
			label="{labelAll} ({_items.length})"
			bind:checked={() => allSelected, (checked) => (_items = mapSelected(_items, checked))}
		/>
		<div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
			{#each _items as item (item.id)}
				<InputBoolean bind:checked={item.selected} label={getLabel(item)}>
					{#snippet labelAppend()}
						{@render append?.(item)}
					{/snippet}
				</InputBoolean>
			{/each}
		</div>
	{:else}
		<Placeholder>{placeholder}</Placeholder>
	{/if}
</Section>

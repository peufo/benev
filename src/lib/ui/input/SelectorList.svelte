<script lang="ts" generics="Item extends {id: string}">
	import { selector } from '$lib/ui/input/selector.js'

	interface Props {
		class?: string
		items: Item[]
		isError?: boolean
		isLoading?: boolean
		focusIndex?: number
		trigger?: HTMLElement | undefined
		keyDownEvent?: KeyboardEvent | undefined
		keyDownPreventDefault?: boolean
		/** Remplace l'évènement `select` de la version Svelte 4. */
		onSelect?: (index: number) => void
		children?: import('svelte').Snippet<[{ item: Item; index: number }]>
	}

	let {
		class: klass = '',
		items,
		isError = false,
		isLoading = false,
		focusIndex = $bindable(0),
		trigger = undefined,
		keyDownEvent = undefined,
		keyDownPreventDefault = true,
		onSelect,
		children,
	}: Props = $props()
</script>

<ul
	use:selector={{
		trigger,
		focusIndex,
		onSelect: (index) => onSelect?.(index),
		onFocus: (index) => (focusIndex = index),
		keyDownEvent,
		keyDownPreventDefault,
	}}
	class="flex flex-col gap-1 {klass}"
>
	{#if isError}
		<li class="p-2 text-center">Erreur 🥲</li>
	{:else}
		{#each items as item, index (item.id)}
			{@const isFocused = focusIndex === index}
			<li
				role="menuitem"
				onclick={() => onSelect?.(index)}
				onkeydown={() => onSelect?.(index)}
				class="flex cursor-pointer items-center justify-start gap-3 rounded px-3 py-2 hover:bg-base-200"
				class:bg-base-300={isFocused}
			>
				{@render children?.({ item, index })}
			</li>
		{:else}
			<li class="px-3 py-2 rounded opacity-70">
				{isLoading ? 'Chargement...' : 'Aucun élément'}
			</li>
		{/each}
	{/if}
</ul>

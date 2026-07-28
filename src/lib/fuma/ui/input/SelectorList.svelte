<script lang="ts" generics="Item extends {id: string}">
	import { createEventDispatcher } from 'svelte'
	import { selector } from '$lib/fuma/action/selector.js'

	

	interface Props {
		class?: string;
		items: Item[];
		isError?: boolean;
		isLoading?: boolean;
		focusIndex?: number;
		trigger?: HTMLElement | undefined;
		keyDownEvent?: KeyboardEvent | undefined;
		keyDownPreventDefault?: boolean;
		children?: import('svelte').Snippet<[any]>;
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
		children
	}: Props = $props();

	const dispatch = createEventDispatcher<{ select: number }>()
</script>

<ul
	use:selector={{
		trigger,
		focusIndex,
		onSelect: (index) => dispatch('select', index),
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
				onclick={() => dispatch('select', index)}
				onkeydown={() => dispatch('select', index)}
				class="flex cursor-pointer items-center justify-start gap-3 rounded px-3 py-2 hover:bg-base-200"
				class:bg-base-300={isFocused}
			>
				{@render children?.({ item, index, })}
			</li>
		{:else}
			<li class="px-3 py-2 rounded opacity-70">
				{isLoading ? 'Chargement...' : 'Aucun élément'}
			</li>
		{/each}
	{/if}
</ul>

<script lang="ts">
	import { selector } from '$lib/action'
	import { createEventDispatcher } from 'svelte'

	let klass = ''
	export { klass as class }

	type Item = $$Generic<{ id: string }>
	export let items: Item[]
	export let isError = false
	export let isLoading = false
	export let focusIndex = 0
	export let trigger: HTMLElement | undefined = undefined
	export let keyDownEvent: KeyboardEvent | undefined = undefined
	export let keyDownPreventDefault = true

	const dispatch = createEventDispatcher<{ select: number }>()
</script>

<ul
	use:selector={{
		trigger,
		focusIndex,
		onSelect: (index) => dispatch('select', index),
		onFocus: (index) => (focusIndex = index),
		keyDownEvent,
		keyDownPreventDefault
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
				on:click={() => dispatch('select', index)}
				on:keydown={() => dispatch('select', index)}
				class="flex justify-start gap-3 items-center hover:bg-base-200 px-3 py-2 rounded cursor-pointer"
				class:bg-base-300={isFocused}
			>
				<slot {item} {index} />
			</li>
		{:else}
			<li class="px-3 py-2 rounded opacity-70">
				{isLoading ? 'Chargement...' : 'Aucun élément'}
			</li>
		{/each}
	{/if}
</ul>

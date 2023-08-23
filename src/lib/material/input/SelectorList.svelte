<script lang="ts">
	import { tick } from 'svelte'

	import { createEventDispatcher } from 'svelte'
	import { fade, fly, slide } from 'svelte/transition'

	type Item = $$Generic<{ id: string }>
	export let items: Item[]

	export let isError = false
	export let isLoading = false
	export let focusIndex = 0

	export let isOpen = false
	let isInvisible = false

	export async function close() {
		// wait for click event dispatch
		await tick()
		isInvisible = true
		setTimeout(() => {
			isOpen = false
		}, 200)
	}
	export function open() {
		isInvisible = false
		isOpen = true
	}

	const dispatch = createEventDispatcher<{ select: number }>()
</script>

{#if isOpen}
	<ul
		in:fly|local={{ y: 20, duration: 100 }}
		out:fade|local={{ duration: 100, delay: 150 }}
		class="z-10 absolute translate-y-2 bg-base-200 rounded-box p-2 flex flex-col gap-1"
		class:opacity-0={isInvisible}
	>
		{#if isError}
			<li class="p-2 text-center">Erreur 🥲</li>
		{:else}
			{#each items as item, index (item.id)}
				{@const isFocused = focusIndex === index}
				<li
					transition:slide|local={{ duration: 100 }}
					role="menuitem"
					on:click={() => dispatch('select', index)}
					on:keydown={() => dispatch('select', index)}
					class="flex btn justify-start btn-ghost btn-sm btn-block"
					class:btn-active={isFocused}
				>
					<slot {item} />
				</li>
			{:else}
				<li transition:slide|local={{ duration: 100 }} class="btn btn-disabled btn-sm">
					{isLoading ? 'Chargement...' : 'Aucun élément'}
				</li>
			{/each}
		{/if}
	</ul>
{/if}

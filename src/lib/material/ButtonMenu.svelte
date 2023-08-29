<script lang="ts">
	import { fly } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'

	import debounce from 'debounce'

	export let open = false
	export let label = 'No label'
	export let buttonClass = ''
	export let right = false

	export const setOpen = () => {
		open = true
	}
	export const close = () => {
		open = false
	}
	const dispatch = createEventDispatcher<{ mouseLeave: void }>()

	const handleMouseLeave = debounce(() => {
		dispatch('mouseLeave')
		close()
	}, 300)
</script>

<div
	class="relative"
	on:mouseenter={handleMouseLeave.clear}
	on:mouseleave={handleMouseLeave}
	role="menu"
	tabindex="0"
>
	<slot name="btn">
		<button class="btn {buttonClass}" on:click={() => (open = true)}>
			<slot name="prepend-label" />
			{label}
		</button>
	</slot>

	{#if open}
		<div
			class="card bg-base-100 absolute top-10 z-10 shadow-lg bordered max-h-64 overflow-y-auto"
			class:right-0={right}
			transition:fly|local={{ y: 30, duration: 200 }}
		>
			<slot>No content</slot>
		</div>
	{/if}
</div>

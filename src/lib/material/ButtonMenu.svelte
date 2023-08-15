<script lang="ts">
	import { fly } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'

	import debounce from 'debounce'

	export let open = false
	export let label = 'No label'
	export let buttonClass = ''

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
	<button class="btn {buttonClass}" on:click={() => (open = true)}>
		<slot name="prepend-label" />
		{label}
	</button>

	{#if open}
		<div
			class="card bg-base-100 absolute top-12 z-10 shadow-lg bordered"
			transition:fly|local={{ y: 30, duration: 200 }}
		>
			<slot>No content</slot>
		</div>
	{/if}
</div>

<script lang="ts">
	import { slide } from 'svelte/transition'
	import { mdiChevronRight } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { urlParam } from '$lib/store'

	export let value: string
	let klass = ''
	export { klass as class }

	$: isOpen = $urlParam.hasValue('section', value)

	let card: HTMLDivElement

	function handleClick() {
		setTimeout(() => {
			window.scrollTo({ top: card.offsetTop - 20, behavior: 'smooth' })
		}, 250)
	}
</script>

<div class="card bg-base-100 border shadow-md {klass}" bind:this={card}>
	<div class="flex gap-2">
		<slot name="logo" />

		<a
			id={value}
			class="pt-8 pb-4 px-4 md:p-8 grow {$$slots.logo ? 'pl-0 md:pl-0' : ''}"
			href={$urlParam.toggle({ section: value })}
			data-sveltekit-noscroll
			on:click={handleClick}
		>
			<div class="flex gap-2">
				<div class="card-title grow">
					<slot name="title" />
				</div>
				<Icon path={mdiChevronRight} class="transition-transform {isOpen ? 'rotate-90' : ''}" />
			</div>

			{#if $$slots.subtitle}
				<div class="text-sm opacity-80 mt-2">
					<slot name="subtitle" />
				</div>
			{/if}
		</a>
	</div>

	{#if isOpen}
		<div class="card-body pt-0 px-4 md:p-8 md:pt-0" transition:slide={{ duration: 200 }}>
			<slot />
		</div>
	{/if}
</div>

<script lang="ts">
	import { slide } from 'svelte/transition'
	import { mdiChevronRight } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { urlParam } from '$lib/store'
	import { onDestroy } from 'svelte'

	export let value: string
	let klass = ''
	export { klass as class }

	$: isOpen = $urlParam.hasValue('section', value)

	let card: HTMLDivElement

	let timeout: NodeJS.Timeout
	function handleClick() {
		timeout = setTimeout(() => {
			if (!card) return
			window.scrollTo({ top: card.offsetTop - 20, behavior: 'smooth' })
		}, 250)
	}

	onDestroy(() => {
		clearTimeout(timeout)
	})
</script>

<div class="card bg-base-100 border bordered shadow-md {klass}" bind:this={card}>
	<div class="flex gap-2">
		<slot name="logo" />

		<a
			id={value}
			class="grow p-2 md:p-8 min-w-0 {$$slots.logo ? 'pl-0 md:pl-0' : ''}"
			href={$urlParam.toggle({ section: value })}
			data-sveltekit-noscroll
			data-sveltekit-replacestate
			on:click={handleClick}
		>
			<div class="flex gap-2">
				<div class="title overflow-hidden text-ellipsis min-w-0">
					<slot name="title" />
				</div>
				<Icon
					path={mdiChevronRight}
					class="ml-auto transition-transform {isOpen ? 'rotate-90' : ''}"
				/>
			</div>

			{#if $$slots.subtitle}
				<div class="text-sm opacity-80 mt-2">
					<slot name="subtitle" />
				</div>
			{/if}
		</a>
	</div>

	{#if isOpen}
		<div class="card-body p-4 pt-0 md:p-8 md:pt-0" transition:slide={{ duration: 200 }}>
			<slot />
		</div>
	{/if}
</div>

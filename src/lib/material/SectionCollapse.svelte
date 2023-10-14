<script lang="ts">
	import { slide } from 'svelte/transition'
	import { mdiChevronRight } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { urlParam } from '$lib/store'

	export let value: string
	let klass = ''
	export { klass as class }

	$: isOpen = $urlParam.hasValue('section', value)
</script>

<div class="card border shadow-md {klass}">
	<a class="p-7" href={$urlParam.toggle({ section: value })} data-sveltekit-noscroll>
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

	{#if isOpen}
		<div class="card-body pt-0" transition:slide={{ duration: 200 }}>
			<slot />
		</div>
	{/if}
</div>

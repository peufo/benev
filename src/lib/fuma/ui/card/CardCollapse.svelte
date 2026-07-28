<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (header to header_1) making the component unusable -->
<script lang="ts">
	import { onDestroy } from 'svelte'
	import { slide } from 'svelte/transition'
	import { mdiChevronRight } from '@mdi/js'

	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { urlParam } from '$lib/fuma/store/index.js'
	import { goto } from '$app/navigation'

	export let value: string
	let klass = ''
	export { klass as class }
	export let classHeader = ''
	export let classBody = ''
	export let classTitle = ''

	$: isOpen = $urlParam.hasValue('section', value)
	let header: HTMLDivElement

	let timeout: NodeJS.Timeout | undefined
	async function handleClick(event: MouseEvent | null) {
		if (isClickOnInteractiveElement(event)) return
		await goto($urlParam.toggle({ section: value }), { noScroll: true, keepFocus: true })
	}

	function isClickOnInteractiveElement(event: MouseEvent | null) {
		if (!event) return false
		const target = event.target as HTMLElement
		const elements = [...header.querySelectorAll('a, button')]
		return !!elements.filter((element) => element.contains(target)).length
	}

	onDestroy(() => {
		clearTimeout(timeout)
	})
</script>

<section class="card bordered border bg-base-100 shadow-md {klass}">
	<div
		id={value}
		bind:this={header}
		tabindex="0"
		class="min-w-0 grow cursor-pointer p-2 sm:px-5 sm:py-3 {classHeader}"
		role="link"
		on:click={handleClick}
		on:keydown={(e) => e.key === ' ' && handleClick(null)}
	>
		<slot name="header">
			<div class="flex gap-2">
				<div class="min-w-0 overflow-hidden text-ellipsis font-medium {classTitle}">
					<slot name="title" />
				</div>
				<Icon
					path={mdiChevronRight}
					class="ml-auto opacity-80 transition-transform {isOpen ? 'rotate-90' : ''}"
				/>
			</div>

			<slot name="subtitle" />
		</slot>
	</div>

	{#if isOpen}
		<div
			class="card-body p-2 pt-0 sm:px-5 sm:py-3 {classBody}"
			transition:slide={{ duration: 200 }}
		>
			<slot />
		</div>
	{/if}
</section>

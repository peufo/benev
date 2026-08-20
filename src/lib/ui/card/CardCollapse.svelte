<script lang="ts">
	import { ChevronRightIcon } from '@lucide/svelte'
	import type { Snippet } from 'svelte'
	import { onDestroy } from 'svelte'
	import { slide } from 'svelte/transition'

	import { urlParam } from 'fuma'
	import { goto } from '$app/navigation'

	interface Props {
		value: string
		class?: string
		classHeader?: string
		classBody?: string
		classTitle?: string
		/** Remplace tout le bandeau, chevron compris. */
		header?: Snippet
		title?: Snippet
		subtitle?: Snippet
		children?: Snippet
	}

	let {
		value,
		class: klass = '',
		classHeader = '',
		classBody = '',
		classTitle = '',
		// Renommé à la destructuration: `header` sert aussi de référence à l'élément.
		header: headerSnippet,
		title,
		subtitle,
		children,
	}: Props = $props()

	let isOpen = $derived(urlParam.has('section', value))
	let header: HTMLDivElement

	let timeout: NodeJS.Timeout | undefined = undefined
	async function handleClick(event: MouseEvent | null) {
		if (isClickOnInteractiveElement(event)) return
		await goto(urlParam.toggle({ section: value }), { noScroll: true, keepFocus: true })
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

<section
	class={[
		'card border border-soft bg-base-100',
		'shadow hover:shadow-md hover:border-hard transition-all',
		klass,
	]}
>
	<div
		id={value}
		bind:this={header}
		tabindex="0"
		class={['min-w-0 grow cursor-pointer p-2 sm:px-5 sm:py-3', classHeader]}
		role="link"
		onclick={handleClick}
		onkeydown={(e) => e.key === ' ' && handleClick(null)}
	>
		{#if headerSnippet}
			{@render headerSnippet()}
		{:else}
			<div class="flex gap-2">
				<div class="min-w-0 overflow-hidden text-ellipsis font-medium {classTitle}">
					{@render title?.()}
				</div>
				<ChevronRightIcon
					class="ml-auto opacity-80 transition-transform {isOpen ? 'rotate-90' : ''}"
				/>
			</div>

			{@render subtitle?.()}
		{/if}
	</div>

	{#if isOpen}
		<div
			class="card-body p-2 pt-0 sm:px-5 sm:py-3 {classBody}"
			transition:slide={{ duration: 200 }}
		>
			{@render children?.()}
		</div>
	{/if}
</section>

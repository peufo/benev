<script lang="ts">
	import type { Snippet } from 'svelte'
	import { slide } from 'svelte/transition'
	import { mdiChevronRight } from '@mdi/js'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'

	// Le slot `title` de la version Svelte 4 entrait en collision avec la prop `title`
	// une fois converti en snippet. Il n'était utilisé nulle part: supprimé.
	type Props = { isActive?: boolean; class?: string; contentClass?: string; children?: Snippet } & (
		{ isReducible: true; title: string } | { isReducible?: false; title?: string }
	)

	let {
		title = '',
		isActive = $bindable(false),
		isReducible = false,
		class: klass = '',
		contentClass = '',
		children,
	}: Props = $props()

	function open() {
		isActive = true
	}
	function toggle(event: Event) {
		event.stopPropagation()
		isActive = !isActive
	}
</script>

<div>
	{#if isReducible && isActive}
		<div class="h-4" transition:slide></div>
	{/if}

	<section class="{klass} flex flex-col">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			onclick={open}
			onkeyup={open}
			class="flex items-center gap-2 py-2
				{isReducible && !isActive ? 'cursor-pointer rounded-lg hover:bg-base-200/40' : ''}
			"
			class:rounded-lg={!isActive}
			class:border={isReducible && !isActive}
		>
			{#if isReducible || title}
				<h2
					class="title-md origin-left pl-1 transition-transform"
					class:translate-x-4={isReducible && !isActive}
					class:scale-105={isReducible && isActive}
				>
					{title}
				</h2>
			{/if}
			{#if isReducible}
				<div class="grow"></div>
				<button
					type="button"
					onclick={toggle}
					class="btn btn-square btn-ghost btn-sm transition-transform"
					class:-translate-x-2={isReducible && !isActive}
				>
					<Icon path={mdiChevronRight} class="transition-transform {isActive ? 'rotate-90' : ''}" />
				</button>
			{/if}
		</div>

		{#if !isReducible || isActive}
			<div transition:slide|local={{ duration: 200 }} class="{contentClass} grow py-4">
				{@render children?.()}
			</div>
		{:else}
			<div class="hidden">{@render children?.()}</div>
		{/if}
	</section>

	{#if isReducible && isActive}
		<div class="h-8" transition:slide></div>
	{/if}
</div>

<!-- @migration-task Error while migrating Svelte code: This migration would change the name of a slot (title to title_1) making the component unusable -->
<script lang="ts">
	import { slide } from 'svelte/transition'
	import { mdiChevronRight } from '@mdi/js'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	type Props = { isActive?: boolean; class?: string; contentClass?: string }
	type $$Props = Props &
		({ isReducible: true; title: string } | { isReducible?: false; title?: string })

	export let title = ''
	export let isActive = false
	export let isReducible = false

	let klass = ''
	export { klass as class }
	export let contentClass = ''

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
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			on:click={open}
			on:keyup={open}
			class="flex items-center gap-2 py-2
				{isReducible && !isActive ? 'cursor-pointer rounded-lg hover:bg-base-200/40' : ''}
			"
			class:rounded-lg={!isActive}
			class:border={isReducible && !isActive}
		>
			<slot name="title">
				{#if isReducible || title}
					<h2
						class="title-md origin-left pl-1 transition-transform"
						class:translate-x-4={isReducible && !isActive}
						class:scale-105={isReducible && isActive}
					>
						{title}
					</h2>
				{/if}
			</slot>
			{#if isReducible}
				<div class="grow" />
				<button
					type="button"
					on:click={toggle}
					class="btn btn-square btn-ghost btn-sm transition-transform"
					class:-translate-x-2={isReducible && !isActive}
				>
					<Icon path={mdiChevronRight} class="transition-transform {isActive ? 'rotate-90' : ''}" />
				</button>
			{/if}
		</div>

		{#if !isReducible || isActive}
			<div transition:slide|local={{ duration: 200 }} class="{contentClass} grow py-4">
				<slot />
			</div>
		{:else}
			<div class="hidden"><slot /></div>
		{/if}
	</section>

	{#if isReducible && isActive}
		<div class="h-8" transition:slide></div>
	{/if}
</div>

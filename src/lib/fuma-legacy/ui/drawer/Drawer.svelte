<script lang="ts">
	import { onDestroy, onMount } from 'svelte'
	import { fade } from 'svelte/transition'
	import { mdiClose } from '@mdi/js'

	import { goto } from '$app/navigation'
	import { urlParam } from 'fuma'
	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import { subscibeDrawerLayers } from '$lib/fuma-legacy/ui/drawer/layers.js'
	import { contextContainer } from '$lib/fuma-legacy/ui/context.js'
	import { drawerFly } from '$lib/fuma-legacy/ui/drawer/drawerFly.js'

	interface Props {
		title?: string
		/** Key used in url query params */
		key: string
		class?: string
		maxWidth?: string
		classHeader?: string
		classBody?: string
		duration?: number
		noOverlay?: boolean
		transitionX?: number
		zIndex?: number
		children?: import('svelte').Snippet<[any]>
	}

	let {
		title = '',
		key,
		class: klass = '',
		maxWidth = '32rem',
		classHeader = '',
		classBody = '',
		duration = 180,
		noOverlay = false,
		transitionX = $bindable(0),
		zIndex = 50,
		children,
	}: Props = $props()

	type GotoOptions = Parameters<typeof goto>[1]
	export function open(value = 1, options: GotoOptions = {}) {
		return goto(urlParam.with({ [key]: value }), {
			...options,
			replaceState: true,
			noScroll: true,
		})
	}
	export function close(options: GotoOptions = {}) {
		return goto(urlParam.without(key), { ...options, replaceState: true, noScroll: true })
	}

	const { offset, index, destroy, isActive } = subscibeDrawerLayers(key)
	onDestroy(destroy)
	contextContainer.set('drawer')
	let clientWidth = $state(0)

	onMount(() => {
		transitionX = $isActive ? clientWidth : 0
	})
</script>

{#if !noOverlay && $isActive}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		onclick={() => close()}
		onkeyup={() => close()}
		transition:fade={{ duration }}
		style="z-index: {zIndex + $index};"
		class="fixed inset-0 bg-black/15 backdrop-blur-[1.5px] dark:bg-white/15"
	></div>
{/if}

{#if $isActive}
	<aside
		bind:clientWidth
		transition:drawerFly|local={{
			x: clientWidth,
			duration,
			opacity: 1,
			onTransition(pos) {
				transitionX = pos.x
			},
		}}
		style="
			z-index: {zIndex + $index};
			max-width: min(100%, {maxWidth});
			transform: translateX({-$offset * 4}rem);
			transition-duration: {duration}ms;
		"
		class:border-l={noOverlay}
		class="{klass} fixed
      bottom-0 right-0 top-0 z-10 flex
			w-full flex-col overflow-y-scroll bg-base-100
			transition-transform
    "
	>
		<div
			class="{classHeader}
				sticky top-0 z-20 flex items-center
				justify-between gap-2 border-b bg-base-100 p-4 pl-8
			"
		>
			<h2 class="title min-w-0 overflow-hidden">{title}</h2>
			<button onclick={() => close()} class="btn btn-square btn-sm">
				<Icon path={mdiClose} title="Fermer" />
			</button>
		</div>

		<div class="{classBody} grow pl-8 pr-4">
			{@render children?.({ open, close })}
		</div>
	</aside>
{/if}

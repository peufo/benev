<script lang="ts">
	import { GripHorizontalIcon, GripIcon, GripVerticalIcon, type IconProps } from '@lucide/svelte'
	import type { Component } from 'svelte'
	import { createBubbler, stopPropagation } from 'svelte/legacy'

	const bubble = createBubbler()
	import { browser } from '$app/environment'
	import { onDestroy } from 'svelte'

	type Axis = 'any' | 'x' | 'y'
	interface Props {
		axis?: Axis
		class?: string
		/** Remplacent les évènements de la version Svelte 4. */
		onmove?: (value: Dot) => void
		ondone?: (value: Dot) => void
	}

	let { axis = 'any', class: klass = '', onmove, ondone }: Props = $props()

	const icons: Record<Axis, Component<IconProps>> = {
		any: GripIcon,
		x: GripHorizontalIcon,
		y: GripVerticalIcon,
	}
	const AxisIcon = $derived(icons[axis])
	type Dot = { x: number; y: number }

	let origin = { x: 0, y: 0 }
	function handleMouseDown(event: MouseEvent) {
		origin.y = event.clientY
		origin.x = event.clientX
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp, { once: true })
	}

	function getDelta({ clientX, clientY }: MouseEvent): Dot {
		return { x: clientX - origin.x, y: clientY - origin.y }
	}

	function handleMouseMove(event: MouseEvent) {
		onmove?.(getDelta(event))
	}

	function handleMouseUp(event: MouseEvent) {
		event.preventDefault()
		event.stopPropagation()
		document.removeEventListener('mousemove', handleMouseMove)
		ondone?.(getDelta(event))
	}

	onDestroy(() => {
		if (!browser) return
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', handleMouseUp)
	})
</script>

<button
	onclick={stopPropagation(bubble('click'))}
	onmousedown={handleMouseDown}
	class="
    {klass} drag-button
    absolute z-10 -translate-x-1/2 -translate-y-1/2
    hidden group-hover:block outline outline-2 outline-base-300
    bg-base-100 hover:bg-base-200 rounded-md btn-xs btn-square
  "
>
	<AxisIcon />
</button>

<style>
	:global(:has(.drag-button-hidden) .group:hover .drag-button) {
		display: none;
	}
</style>

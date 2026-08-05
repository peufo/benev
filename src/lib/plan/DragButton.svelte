<script lang="ts">
	import { GripIcon, type IconProps } from '@lucide/svelte'
	import type { Component } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import type { Attachment } from 'svelte/attachments'
	import { on } from 'svelte/events'

	type Dot = { x: number; y: number }
	interface Props {
		icon?: Component<IconProps>
		class?: ClassValue
		onmove?: (value: Dot) => void
		ondone?: (value: Dot) => void
	}

	let { icon: Icon = GripIcon, class: klass = '', onmove, ondone }: Props = $props()

	const drag: Attachment<HTMLButtonElement> = (node) => {
		let origin = { x: 0, y: 0 }
		let stopDragging = () => {}

		function getDelta({ clientX, clientY }: MouseEvent): Dot {
			return { x: clientX - origin.x, y: clientY - origin.y }
		}

		const stopMouseDown = on(node, 'mousedown', (event) => {
			node.classList.add('cursor-grabbing')
			stopDragging()
			origin = { x: event.clientX, y: event.clientY }

			const stopMouseMove = on(document, 'mousemove', (event) => onmove?.(getDelta(event)))
			const stopMouseUp = on(document, 'mouseup', (event) => {
				node.classList.remove('cursor-grabbing')
				event.preventDefault()
				event.stopPropagation()
				stopDragging()
				ondone?.(getDelta(event))
			})

			stopDragging = () => {
				stopMouseMove()
				stopMouseUp()
				stopDragging = () => {}
			}
		})

		return () => {
			stopMouseDown()
			stopDragging()
		}
	}
</script>

<button
	{@attach drag}
	class={[
		'drag-button cursor-grab',
		'absolute z-10 -translate-x-1/2 -translate-y-1/2',
		'hidden group-hover:block',
		'btn btn-circle btn-accent btn-soft  h-6 w-6',
		klass,
	]}
>
	<Icon size={14} class="mx-auto" />
</button>

<style>
	:global(:has(.drag-button-hidden) .drag-button) {
		display: none;
	}
</style>

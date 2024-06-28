<script lang="ts">
	import { browser } from '$app/environment'
	import { mdiDrag, mdiDragHorizontal, mdiDragVertical } from '@mdi/js'
	import { Icon } from 'fuma'
	import { createEventDispatcher, onDestroy } from 'svelte'

	type Axis = 'any' | 'x' | 'y'
	export let axis: Axis = 'any'
	let klass = ''
	export { klass as class }
	const paths: Record<Axis, string> = {
		any: mdiDrag,
		x: mdiDragHorizontal,
		y: mdiDragVertical,
	}
	type Dot = { x: number; y: number }

	const dispatch = createEventDispatcher<{ move: Dot; done: Dot }>()

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
		dispatch('move', getDelta(event))
	}

	function handleMouseUp(event: MouseEvent) {
		event.preventDefault()
		event.stopPropagation()
		document.removeEventListener('mousemove', handleMouseMove)
		dispatch('done', getDelta(event))
	}

	onDestroy(() => {
		if (!browser) return
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', handleMouseUp)
	})
</script>

<button
	on:click|stopPropagation
	on:mousedown={handleMouseDown}
	class="
    {klass}
    absolute z-10 -translate-x-1/2 -translate-y-1/2
    hidden group-hover:block outline outline-2 outline-base-300
    bg-base-100 hover:bg-base-200 rounded-md btn-xs btn-square
  "
>
	<Icon path={paths[axis]} />
</button>

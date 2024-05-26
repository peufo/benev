<script lang="ts">
	import { browser } from '$app/environment'
	import { mdiDrag, mdiDragHorizontal, mdiDragVertical } from '@mdi/js'
	import { Icon } from 'fuma'
	import { createEventDispatcher, onDestroy } from 'svelte'

	type Orientation = 'any' | 'horizontal' | 'vertical'
	export let orientation: Orientation = 'any'
	let klass = ''
	export { klass as class }
	const paths: Record<Orientation, string> = {
		any: mdiDrag,
		horizontal: mdiDragHorizontal,
		vertical: mdiDragVertical,
	}

	const dispatch = createEventDispatcher<{ move: number; done: number }>()

	let origin = 0
	function handleMouseDown(event: MouseEvent) {
		origin = event.clientY
		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp, { once: true })
	}

	function handleMouseMove(event: MouseEvent) {
		const delta = event.clientY - origin
		dispatch('move', delta)
	}

	function handleMouseUp(event: MouseEvent) {
		document.removeEventListener('mousemove', handleMouseMove)
		const delta = event.clientY - origin
		dispatch('done', delta)
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
    hidden group-hover:block outline outline-1 outline-secondary
    bg-base-100 hover:bg-base-200 rounded-md btn-xs btn-square
  "
>
	<Icon path={paths[orientation]} />
</button>

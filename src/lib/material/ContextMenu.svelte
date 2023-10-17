<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { DropDown } from '$lib/material'
	import type { Props as TippyProps } from 'tippy.js'

	export let tippyProps: Partial<TippyProps> = {}
	let klass = ''
	export { klass as class }

	const dispatch = createEventDispatcher<{ show: void; hide: void }>()

	let dropdown: DropDown

	export function show(event: MouseEvent) {
		const target = event.target as HTMLElement
		if (!target || !(target instanceof HTMLElement)) return
		dropdown.setTippyProps({
			getReferenceClientRect: () => new DOMRect(event.clientX, event.clientY),
		})
		dropdown.show()
		dispatch('show')
	}

	export function hide() {
		dropdown.hide()
		dispatch('hide')
	}
</script>

<DropDown
	class="{klass} overflow-visible"
	bind:this={dropdown}
	tippyProps={{ offset: [0, -5], ...tippyProps }}
>
	<slot />
</DropDown>

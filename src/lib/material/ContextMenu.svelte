<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { DropDown } from '$lib/material'

	const dispatch = createEventDispatcher<{ show: void; hide: void }>()

	let dropdown: DropDown

	export function show(event: MouseEvent) {
		const target = event.target as HTMLElement
		if (!target || !(target instanceof HTMLElement)) return

		dropdown.setTippyProps({
			getReferenceClientRect: () => target.getBoundingClientRect(),
		})
		dropdown.show()
		dispatch('show')
	}

	export function hide() {
		dropdown.hide()
		dispatch('hide')
	}
</script>

<DropDown bind:this={dropdown}>
	<slot />
</DropDown>

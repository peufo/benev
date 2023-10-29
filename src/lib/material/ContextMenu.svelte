<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { Dialog, DropDown } from '$lib/material'
	import { isMobile } from '$lib/store'
	import type { Props as TippyProps } from 'tippy.js'

	export let tippyProps: Partial<TippyProps> = {}
	let klass = ''
	export { klass as class }

	const dispatch = createEventDispatcher<{ show: void; hide: void }>()

	let dropdown: DropDown
	let dialog: HTMLDialogElement

	export function show(event: MouseEvent) {
		if ($isMobile) {
			dialog?.showModal()
		} else {
			const target = event.target as HTMLElement
			if (!target || !(target instanceof HTMLElement)) return
			dropdown?.setTippyProps({
				getReferenceClientRect: () => new DOMRect(event.clientX, event.clientY),
			})
			dropdown?.show()
		}

		dispatch('show')
	}

	export function hide() {
		if ($isMobile) dialog?.close()
		else dropdown?.hide()
		dispatch('hide')
	}
</script>

{#if $isMobile}
	<Dialog bind:dialog class={klass}>
		<div slot="header" class="contents">
			<slot name="header" />
		</div>
		<slot />
	</Dialog>
{:else}
	<DropDown class={klass} bind:this={dropdown} tippyProps={{ offset: [0, -5], ...tippyProps }}>
		<div class="flex flex-col gap-2 p-1">
			<slot name="header" />
			<slot />
		</div>
	</DropDown>
{/if}

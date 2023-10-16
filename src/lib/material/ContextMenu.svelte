<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { fade, type FadeParams } from 'svelte/transition'
	import { debounce } from 'debounce'

	import { Dialog } from '$lib/material'
	import { browser } from '$app/environment'

	export let fadeParamsIn: FadeParams = { duration: 150 }
	export let fadeParamsOut: FadeParams = { duration: 150 }

	let dialog: HTMLDialogElement
	let isOpen = false
	let isDialog = false

	const dispatch = createEventDispatcher<{ open: void; close: void }>()

	type Position = { x: number; y: number }
	let position: Position = { x: 0, y: 0 }
	let mouseHover = false
	let menuHeight: number
	let menuWidth: number

	export function open(_position?: Position) {
		if (_position) {
			position = { x: _position.x - 92, y: _position.y - 20 }
		}
		if (dialog) dialog.showModal()
		isOpen = true
		dispatch('open')
	}

	export function close() {
		if (dialog) dialog.close()
		isOpen = false
		dispatch('close')
	}

	const handleMouseLeave = debounce(() => {
		mouseHover || close()
	}, 400)

	$: {
		if (browser) {
			const { offsetWidth, offsetHeight } = document.body
			isDialog = offsetWidth < 900
			if (position.y + menuHeight > offsetHeight) {
				position.y = offsetHeight - menuHeight - 10
			}
			if (position.x + menuWidth > offsetWidth) {
				position.x = offsetWidth - menuWidth - 10
			}
		}
	}
</script>

{#if isDialog}
	<Dialog bind:dialog>
		<slot />
	</Dialog>
{:else if isOpen}
	<menu
		bind:offsetHeight={menuHeight}
		bind:offsetWidth={menuWidth}
		in:fade|local={fadeParamsIn}
		out:fade|local={fadeParamsOut}
		on:mouseenter={() => (mouseHover = true)}
		on:mouseleave={() => {
			mouseHover = false
			handleMouseLeave()
		}}
		class="
			border p-2 rounded-xl fixed z-50 shadow-xl
			bg-base-100/40 backdrop-blur
		"
		style="left: {position.x}px; top: {position.y}px;"
	>
		<slot />
	</menu>
{/if}

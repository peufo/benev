<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { mdiClose } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { onMount } from 'svelte'
	export let dialog: HTMLDialogElement
	export let hideCloseButton = false
	let klass = ''
	export { klass as class }

	const dispatch = createEventDispatcher<{ open: void; close: void }>()

	onMount(() => {
		const inputsSelector = 'input:not([type=hidden], [tabindex="-1"])'
		const inputs = dialog.querySelectorAll<HTMLInputElement>(inputsSelector)
		const buttons = dialog.querySelectorAll<HTMLButtonElement>('button')

		inputs.forEach((input) => (input.tabIndex = -1))
		buttons.forEach((button) => (button.tabIndex = -1))

		function onDialogOpen() {
			dispatch('open')
			inputs.forEach((input) => (input.tabIndex = 0))
			buttons.forEach((button) => (button.tabIndex = 0))
			if (!inputs[0]) return
			inputs[0].focus()
			inputs[0].select()
		}

		function onDialogClose() {
			dispatch('close')
			inputs.forEach((input) => (input.tabIndex = -1))
			buttons.forEach((button) => (button.tabIndex = -1))
		}

		const observer = new MutationObserver(() => (dialog.open ? onDialogOpen() : onDialogClose()))
		observer.observe(dialog, { attributeFilter: ['open'] })
		return () => observer.disconnect()
	})
</script>

<dialog bind:this={dialog} class="modal" tabindex="-1">
	<div class="modal-box p-0 rounded-lg flex flex-col border bordered">
		<div class="p-4 border-b flex relative items-center">
			<div class="grow">
				<slot name="header" />
			</div>

			{#if !hideCloseButton}
				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm ml"
					on:click={() => dialog.close()}
				>
					<Icon path={mdiClose} />
				</button>
			{/if}
		</div>
		<div class="p-4 grow overflow-auto {klass}">
			<slot />
		</div>

		<slot name="footer" />
	</div>
</dialog>

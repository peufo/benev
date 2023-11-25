<script lang="ts">
	import { mdiClose } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { onMount } from 'svelte'
	export let dialog: HTMLDialogElement
	export let hideCloseButton = false
	let klass = ''
	export { klass as class }

	onMount(() => {
		const observer = new MutationObserver(() => dialog.open && handleDialogOpen())
		observer.observe(dialog, { attributeFilter: ['open'] })
		return () => observer.disconnect()
	})

	function handleDialogOpen() {
		const selector = 'input:not(input[type=hidden], .btn-close)'
		const firstInput = dialog.querySelector<HTMLInputElement>(selector)
		if (!firstInput) return

		firstInput.focus()
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box p-0 rounded-lg flex flex-col">
		<div class="p-4 border-b flex relative items-center">
			<div class="grow">
				<slot name="header" />
			</div>

			{#if !hideCloseButton}
				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm ml-1 btn-close"
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

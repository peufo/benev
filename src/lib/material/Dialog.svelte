<script lang="ts">
	import { mdiClose } from '@mdi/js'
	import { Icon } from '$lib/material'
	export let dialog: HTMLDialogElement
	export let hideCloseButton = false
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box p-0 rounded-lg flex flex-col">
		<div class="p-4 border-b flex relative">
			<div class="grow sticky top-0">
				<slot name="header" />
			</div>

			{#if !hideCloseButton}
				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm ml-1"
					on:click={() => dialog.close()}
				>
					<Icon path={mdiClose} />
				</button>
			{/if}
		</div>
		<div class="p-4 grow overflow-auto">
			<slot />
		</div>

		<slot name="footer" />
	</div>
</dialog>

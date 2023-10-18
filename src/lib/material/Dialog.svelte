<script lang="ts">
	import { mdiClose } from '@mdi/js'
	import { Icon } from '$lib/material'
	export let dialog: HTMLDialogElement
	export let hideCloseButton = false
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<div class="flex">
			<div class="grow">
				<slot name="header" />
			</div>

			{#if !hideCloseButton}
				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm ml-auto"
					on:click={() => dialog.close()}
				>
					<Icon path={mdiClose} />
				</button>
			{/if}
		</div>
		<slot />
	</div>
</dialog>

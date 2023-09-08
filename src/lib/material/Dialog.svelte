<script lang="ts">
	import { mdiClose } from '@mdi/js'
	import { Icon } from '$lib/material'
	export let title = ''
	export let subtitle = ''
	export let dialog: HTMLDialogElement
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<div class="flex justify-between">
			{#if title}
				<span class="card-title">
					{title}
				</span>
			{/if}

			<button type="button" class="btn btn-square btn-ghost btn-sm" on:click={() => dialog.close()}>
				<Icon path={mdiClose} />
			</button>
		</div>
		<slot />
	</div>
</dialog>

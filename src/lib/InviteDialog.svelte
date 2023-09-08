<script lang="ts">
	import { mdiAccountPlusOutline, mdiClose } from '@mdi/js'
	import InviteForm from '$lib/InviteForm.svelte'
	import { Icon } from '$lib/material'
	let dialog: HTMLDialogElement
	let klass = ''
	export { klass as class }
	export let justIcon = false
</script>

<button
	type="button"
	class="btn {klass}"
	class:btn-square={justIcon}
	on:click={() => dialog.showModal()}
>
	<Icon path={mdiAccountPlusOutline} title={justIcon ? 'Inviter un nouveau membre' : ''} />
	{#if !justIcon}
		Inviter un membre
	{/if}
</button>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box">
		<div class="flex justify-between">
			<span class="card-title">Inviter un nouveau membre</span>
			<button type="button" class="btn btn-square btn-ghost btn-sm" on:click={() => dialog.close()}>
				<Icon path={mdiClose} />
			</button>
		</div>
		<InviteForm on:success={() => dialog.close()} />
	</div>
</dialog>

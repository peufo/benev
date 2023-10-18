<script lang="ts">
	import { mdiAccountPlusOutline, mdiClose } from '@mdi/js'
	import InviteForm from '$lib/InviteForm.svelte'
	import { Icon, Dialog } from '$lib/material'

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

<Dialog bind:dialog>
	<h2 slot="header" class="card-title">Inviter un nouveau membre</h2>
	<InviteForm on:success={() => dialog.close()} />
</Dialog>

<script lang="ts">
	import { Card, Icon } from '$lib/material'
	import { mdiClose } from '@mdi/js'
	import MemberFieldForm from './MemberFieldForm.svelte'

	let formDialog: HTMLDialogElement
</script>

<Card>
	<span slot="title">Profil des membres</span>
	<span slot="subtitle">Informations complémentaires concernant vos membres</span>

	<button class="btn" on:click={() => formDialog.showModal()}> Ajouter un champ </button>
</Card>

<dialog bind:this={formDialog} class="modal">
	<div class="modal-box">
		<div class="flex items-center justify-between pb-4">
			<span class="card-title">
				Ajouter un champ
			</span>
			<button class="btn btn-square btn-ghost btn-sm" on:click={() => formDialog.close()}>
				<Icon path={mdiClose}/>
			</button>
		</div>
		<MemberFieldForm on:success={() => formDialog.close()} />
	</div>
</dialog>

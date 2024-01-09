<script lang="ts">
	import { enhance } from '$app/forms'
	import { Dialog } from '$lib/material'
	import { useForm } from '$lib/validation'
	import type { Event } from '@prisma/client'

	export let event: Event
	let dialog: HTMLDialogElement

	const form = useForm({
		successMessage: 'Évènement supprimé',
	})
</script>

<div class="flex justify-end">
	<button class="btn btn-ghost text-error" type="button" on:click={() => dialog.showModal()}>
		Supprimer l'évènement
	</button>
</div>

<Dialog bind:dialog>
	<h2 slot="header" class="title">Supprimer "{event.name}"</h2>
	<form method="post" action="?/delete_event" use:enhance={form.submit} class="contents">
		<p>
			Es-tu certain de supprimer cette évènement ?<br />
			Cette opération est <b>irréversible !</b>
		</p>

		{#if event.activedAt}
			<p>La license utilisé pour cette évènement n'est pas récupérée.</p>
		{/if}
		<div class="flex justify-end">
			<button class="btn btn-error" type="submit"> Je confirme </button>
		</div>
	</form>
</Dialog>

<script lang="ts">
	import { enhance } from '$app/forms'
	import { Dialog } from 'fuma'
	import { useForm } from 'fuma/validation'
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
	<h2 slot="header" class="title">Supprimer "{event?.name}"</h2>
	<form method="post" action="/{event.id}?/event_delete" use:enhance={form.submit} class="contents">
		<input type="hidden" name="id" value={event?.id} />
		<p>
			Es-tu certain de supprimer cette évènement ?<br />
			Cette opération est <b>irréversible !</b>
		</p>

		{#if event?.activedAt}
			<p>La license utilisé pour cette évènement n'est pas récupérée.</p>
		{/if}
		<div class="flex justify-end">
			<button class="btn btn-error" type="submit"> Je confirme </button>
		</div>
	</form>
</Dialog>

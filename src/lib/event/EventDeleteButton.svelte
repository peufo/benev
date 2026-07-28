<script lang="ts">
	import { enhance } from '$app/forms'
	import { Dialog } from '$lib/fuma'
	import { useForm } from '$lib/fuma'
	import type { Event } from '@prisma/client'

	interface Props {
		event: Event;
	}

	let { event }: Props = $props();
	let dialog: HTMLDialogElement = $state()

	const form = useForm({
		successMessage: 'Évènement supprimé',
	})
</script>

<div class="flex justify-end">
	<button class="btn btn-ghost text-error" type="button" onclick={() => dialog.showModal()}>
		Supprimer l'évènement
	</button>
</div>

<Dialog bind:dialog>
	{#snippet header()}
		<h2  class="title">Supprimer "{event?.name}"</h2>
	{/snippet}
	<form method="post" action="/{event.id}?/event_delete" use:enhance={form.submit} class="contents">
		<input type="hidden" name="id" value={event?.id} />
		<p>
			Es-tu certain de supprimer cette évènement ?<br />
			Cette opération est <b>irréversible !</b>
		</p>

		<div class="flex justify-end">
			<button class="btn btn-error" type="submit"> Je confirme </button>
		</div>
	</form>
</Dialog>

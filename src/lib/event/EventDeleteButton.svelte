<script lang="ts">
	import { Dialog } from 'fuma'
	import type { Event } from '@prisma/client'
	import { enhanceForm } from '$lib/enhanceForm'
	import { deleteEvent } from './event.remote'

	interface Props {
		event: Event
	}

	let { event }: Props = $props()
	let dialog: HTMLDialogElement = $state()!
</script>

<button class="btn btn-error" type="button" onclick={() => dialog.showModal()}>
	Supprimer l'évènement
</button>

<Dialog bind:dialog>
	{#snippet header()}
		<h2 class="title">Supprimer "{event?.name}"</h2>
	{/snippet}
	<form {...deleteEvent.enhance(enhanceForm({ success: 'Évènement supprimé' }))} class="contents">
		<p>
			Es-tu certain de supprimer cette évènement ?<br />
			Cette opération est <b>irréversible !</b>
		</p>

		<div class="flex justify-end">
			<button class="btn btn-error" type="submit"> Je confirme </button>
		</div>
	</form>
</Dialog>

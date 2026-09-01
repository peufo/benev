<script lang="ts">
	import { enhanceForm } from '$lib/enhanceForm'
	import { updateAccount } from './user.remote'

	interface Props {
		oncancel?: () => void
		onsuccess?: () => void
	}

	let { oncancel, onsuccess }: Props = $props()
</script>

<form {...updateAccount.enhance(enhanceForm({ onsuccess: () => onsuccess?.() }))}>
	<input {...updateAccount.fields.isOrganizer.as('hidden', true)} />

	<p>Souhaites-tu organiser des évènements ?</p>

	<div class="flex flex-row-reverse gap-2 items-center mt-4">
		<button class="btn btn-primary">Oui, je le veux </button>
		<button type="button" class="btn btn-ghost" onclick={() => oncancel?.()}>Annuler</button>
	</div>
</form>

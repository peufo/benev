<script lang="ts">
	import { enhanceForm } from '$lib/enhanceForm'
	import { updateAccount } from './user.remote'

	interface Props {
		/** Remplacent les évènements de la version Svelte 4. */
		oncancel?: () => void
		onsuccess?: () => void
	}

	let { oncancel, onsuccess }: Props = $props()
</script>

<form {...updateAccount.enhance(enhanceForm({ onsuccess: () => onsuccess?.() }))}>
	<!-- `as('hidden', true)` nomme le champ `b:isOrganizer`, que SvelteKit reconvertit en
	     booléen. Le jeton `USE_COERCE_BOOLEAN` n'a plus cours. -->
	<input {...updateAccount.fields.isOrganizer.as('hidden', true)} />

	<p>Souhaite-tu devenir organisateur d'évenements ?</p>

	<div class="flex flex-row-reverse gap-2 items-center mt-4">
		<button class="btn btn-primary">Oui, je le veux </button>
		<button type="button" class="btn btn-ghost" onclick={() => oncancel?.()}>Annuler</button>
	</div>
</form>

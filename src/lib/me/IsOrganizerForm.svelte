<script lang="ts">
	import { useForm } from '$lib/fuma-legacy/validation'
	import { enhance } from '$app/forms'
	import { USE_COERCE_BOOLEAN } from 'fuma'

	const form = useForm({
		onSuccess: () => onsuccess?.(),
	})

	interface Props {
		/** Remplacent les évènements de la version Svelte 4. */
		oncancel?: () => void
		onsuccess?: () => void
	}

	let { oncancel, onsuccess }: Props = $props()
</script>

<form method="post" action="/me?/account_update" use:enhance={form.submit}>
	<input type="hidden" name="isOrganizer" value="{USE_COERCE_BOOLEAN}true" />

	<p>Souhaite-tu devenir organisateur d'évenements ?</p>

	<div class="flex flex-row-reverse gap-2 items-center mt-4">
		<button class="btn btn-primary">Oui, je le veux </button>
		<button type="button" class="btn btn-ghost" onclick={() => oncancel?.()}>Annuler</button>
	</div>
</form>

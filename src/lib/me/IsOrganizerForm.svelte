<script lang="ts">
	import { useForm } from 'fuma/validation'
	import { enhance } from '$app/forms'
	import { createEventDispatcher } from 'svelte'
	import { USE_COERCE_BOOLEAN } from 'fuma'

	const form = useForm({
		onSuccess: () => dispatch('success'),
	})

	const dispatch = createEventDispatcher<{ cancel: void; success: void }>()
</script>

<form method="post" action="/me?/account_update" use:enhance={form.submit}>
	<input type="hidden" name="isOrganizer" value="{USE_COERCE_BOOLEAN}true" />

	<p>Souhaite-tu devenir organisateur d'évenements ?</p>

	<div class="flex flex-row-reverse gap-2 items-center mt-4">
		<button class="btn btn-primary">Oui, je le veux </button>
		<button type="button" class="btn btn-ghost" on:click={() => dispatch('cancel')}>Annuler</button>
	</div>
</form>

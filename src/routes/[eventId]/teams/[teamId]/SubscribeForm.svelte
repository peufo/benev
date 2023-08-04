<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'

	export let teamName: string
	export let userId: string
	export let periodId: string
	export let periodLabel: string = ''

	const dispatch = createEventDispatcher<{ close: void; success: void }>()

	const form = useForm({
		successCallback: () => dispatch('success'),
	})
</script>

<form
	action="?/new_subscribe"
	method="post"
	class="modal-box flex flex-col gap-4"
	use:enhance={form.submit}
>
	<input type="hidden" name="userId" value={userId} />
	<input type="hidden" name="periodId" value={periodId} />

	<h2 class="text-2xl">{teamName}</h2>

	<p class="text-lg">Souhaites-tu t'inscrire à la période de travail suivante ?</p>
	<p class="text-lg">{periodLabel}</p>

	<div class="flex gap-2 justify-end">
		<button class="btn btn-ghost" on:click|preventDefault={() => dispatch('close')}> Non </button>

		<button class="btn">Oui je le veux !</button>
	</div>
</form>

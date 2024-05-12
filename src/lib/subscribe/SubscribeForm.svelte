<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import type { Period, Team } from '@prisma/client'
	import { enhance } from '$app/forms'
	import { useForm } from 'fuma/validation'
	import { formatRange } from '$lib/formatRange'

	export let team: Team
	export let memberId: string
	export let period: Period

	const dispatch = createEventDispatcher<{ close: void; success: void }>()

	const form = useForm({
		onSuccess: () => dispatch('success'),
	})
</script>

<form
	action="/{team.eventId}/subscribes?/subscribe_create"
	method="post"
	class="modal-box flex flex-col gap-4"
	use:enhance={form.submit}
>
	<input type="hidden" name="memberId" value={memberId} />
	<input type="hidden" name="periodId" value={period.id} />

	<h2 class="card-title">{team.name}</h2>
	<p class="font-semibold">{formatRange(period)}</p>

	<p>Souhaites-tu t'inscrire à cette période ?</p>

	<div class="flex flex-row-reverse gap-2">
		<button class="btn btn-primary">Oui je le veux !</button>
		<button class="btn btn-ghost" on:click|preventDefault={() => dispatch('close')}> Non </button>
	</div>
</form>

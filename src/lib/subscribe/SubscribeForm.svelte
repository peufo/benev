<script lang="ts">
	import { preventDefault } from 'svelte/legacy'

	import type { Period, Team } from '@prisma/client'
	import { formatRange } from '$lib/formatRange'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createSubscribe } from './subscribe.remote'

	interface Props {
		team: Team
		memberId: string
		period: Period
		/** Remplacent les évènements de la version Svelte 4. */
		onclose?: () => void
		onsuccess?: () => void
	}

	let { team, memberId, period, onclose, onsuccess }: Props = $props()
</script>

<form
	{...createSubscribe.enhance(enhanceForm({ onsuccess: () => onsuccess?.() }))}
	class="modal-box flex flex-col gap-4"
>
	<input type="hidden" name="memberId" value={memberId} />
	<input type="hidden" name="periodId" value={period.id} />

	<h2 class="card-title">{team.name}</h2>
	<p class="font-semibold">{formatRange(period)}</p>

	<p>Souhaites-tu t'inscrire à cette période ?</p>

	<div class="flex flex-row-reverse gap-2">
		<button class="btn btn-primary">Oui je le veux !</button>
		<button class="btn btn-ghost" onclick={preventDefault(() => onclose?.())}> Non </button>
	</div>
</form>

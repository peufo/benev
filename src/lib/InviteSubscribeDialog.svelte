<script lang="ts">
	import { Period } from '@prisma/client'
	import { formatRange } from '$lib/formatRange'
	import { Dialog } from '$lib/material'

	let dialog: HTMLDialogElement
	let period: Period | undefined

	export function open(_period: Period) {
		period = _period
		dialog.showModal()
	}
</script>

<Dialog bind:dialog title="Inviter un membre">
	{#if period}
		<div class="font-semibold">
			{formatRange(period)}
		</div>
	{/if}

	Sélection du membre

	<div class="flex justify-end">
		<button class="btn"> Valider </button>
	</div>
</Dialog>

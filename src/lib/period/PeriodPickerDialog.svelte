<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { Dialog, Button } from 'svelte-materialify'

	import PeriodPicker from '$lib/util/PeriodPicker.svelte'
	import type { IPeriod } from 'types'

	type DateString = Date | string | undefined

	export let active = false
	export let period: IPeriod | undefined

	export let confirmLabel = 'Confirmer'

	interface DispatchEvents {
		comfirm: IPeriod
	}
	const dispatch = createEventDispatcher<DispatchEvents>()

	function handleClickConfirm() {
		dispatch('comfirm', period)
		active = false
	}
</script>

<Dialog bind:active class="pa-4" width="x-large">
	<PeriodPicker bind:period inlineMode />

	<div class="d-flex mt-4">
		<div class="flex-grow-1" />
		<Button text class="red-text" on:click={() => (active = false)}>Annuler</Button>
		<Button on:click={handleClickConfirm}>
			{confirmLabel}
		</Button>
	</div>
</Dialog>

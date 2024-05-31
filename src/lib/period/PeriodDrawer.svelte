<script lang="ts">
	import { Drawer } from 'fuma'
	import PeriodForm from './PeriodForm.svelte'
	import type { Period, Subscribe } from '@prisma/client'
	import { SubscribeInviteForm, SubscribesOfPeriod } from '$lib/subscribe'
	import Progress from '$lib/Progress.svelte'
	import { periodDrawerTransitionX } from '$lib/store'

	type _Period = Partial<Period & { subscribes: Subscribe[] }>

	export let period: _Period

	function periodIsComplet(period: _Period): boolean {
		if (!period.subscribes) return true
		return (
			period.subscribes?.filter(({ state }) => state === 'request' || state === 'accepted')
				.length >= (period.maxSubscribe || 0)
		)
	}
</script>

<Drawer
	key="form_period"
	noOverlay
	maxWidth="400px"
	title="{period.id ? 'Édition' : 'Création'} d'une période"
	bind:transitionX={$periodDrawerTransitionX}
>
	<PeriodForm />

	<div class="p-2 flex flex-col gap-2">
		{#if period.subscribes && period.maxSubscribe}
			<SubscribesOfPeriod subscribes={period.subscribes} />
			<Progress
				period={{ maxSubscribe: period.maxSubscribe, subscribes: period.subscribes }}
				withLabel
			/>
		{/if}

		{#if period.id && !periodIsComplet(period)}
			<SubscribeInviteForm
				periodId={period.id}
				tippyProps={{
					placement: 'bottom-start',
					popperOptions: {
						modifiers: [{ name: 'flip', enabled: false }],
					},
				}}
			/>
		{/if}
	</div>
</Drawer>

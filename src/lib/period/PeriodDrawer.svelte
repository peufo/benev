<script lang="ts">
	import { Drawer } from 'fuma'
	import PeriodForm from './PeriodForm.svelte'
	import type { Member } from '@prisma/client'
	import { periodDrawerTransitionX } from '$lib/store'
	import { SubscribeInviteForm } from '$lib/subscribe'
	import PeriodSubscribes from './PeriodSubscribes.svelte'
	import Progress from '$lib/Progress.svelte'
	import type { FormDataPeriod } from '$lib/server'

	export let period: Partial<FormDataPeriod> = {}
	export let periodForm: PeriodForm

	export function selectMember(m: Member) {
		member = m
	}

	let member: Member | null = null
</script>

<Drawer
	key="form_period"
	noOverlay
	maxWidth="400px"
	title="{period?.id ? 'Édition' : 'Création'} d'une période"
	bind:transitionX={$periodDrawerTransitionX}
>
	<PeriodForm bind:this={periodForm} {period} />

	{#if period?.id}
		<div class="divider" />

		<div class="flex flex-col gap-2 mb-4">
			{#if period.subscribes && period.maxSubscribe}
				<Progress
					period={{ maxSubscribe: period.maxSubscribe, subscribes: period.subscribes }}
					withLabel
				/>
				<PeriodSubscribes subscribes={period.subscribes} />
			{/if}

			{#if period.id && !period.isComplet}
				<SubscribeInviteForm
					bind:member
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
	{/if}
</Drawer>

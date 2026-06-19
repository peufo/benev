<script lang="ts">
	import { Drawer } from 'fuma'
	import { page } from '$app/stores'
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

	let transitionX = 0
	$: noOverlay = !$page.route.id?.startsWith('/[eventId]/admin/plan')
	$: if (noOverlay) $periodDrawerTransitionX = transitionX
</script>

<Drawer
	key="form_period"
	{noOverlay}
	maxWidth="400px"
	title="{period?.id ? 'Édition' : 'Création'} d'une période"
	bind:transitionX
	let:close
>
	<PeriodForm bind:this={periodForm} {period} on:success={() => noOverlay || close()} />

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
					}}
				/>
			{/if}
		</div>
	{/if}
</Drawer>

<script lang="ts">
	import { run } from 'svelte/legacy';

	import { Drawer } from '$lib/fuma'
	import { page } from '$app/stores'
	import PeriodForm from './PeriodForm.svelte'
	import type { Member } from '@prisma/client'
	import { periodDrawerTransitionX } from '$lib/store'
	import { SubscribeInviteForm } from '$lib/subscribe'
	import PeriodSubscribes from './PeriodSubscribes.svelte'
	import Progress from '$lib/Progress.svelte'
	import type { FormDataPeriod } from '$lib/server'
	interface Props {
		period?: Partial<FormDataPeriod>;
		periodForm: PeriodForm;
	}

	let { period = {}, periodForm = $bindable() }: Props = $props();

	export function selectMember(m: Member) {
		member = m
	}

	let member: Member | null = $state(null)

	let transitionX = $state(0)
	let noOverlay = $derived(!$page.route.id?.startsWith('/[eventId]/admin/plan'))
	run(() => {
		if (noOverlay) $periodDrawerTransitionX = transitionX
	});
</script>

<Drawer
	key="form_period"
	{noOverlay}
	maxWidth="400px"
	title="{period?.id ? 'Édition' : 'Création'} d'une période"
	bind:transitionX
	
>
	{#snippet children({ close })}
		<PeriodForm
			bind:this={periodForm}
			{period}
			on:success={() => noOverlay || close()}
			on:delete={() => noOverlay || close()}
			disableRedirect={!noOverlay}
		/>

		{#if period?.id}
			<div class="divider"></div>

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
	{/snippet}
</Drawer>

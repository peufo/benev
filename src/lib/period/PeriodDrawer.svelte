<script lang="ts">
	import { Drawer } from 'fuma'
	import PeriodForm from './PeriodForm.svelte'
	import type { Member, Period, Subscribe, User } from '@prisma/client'
	import { periodDrawerTransitionX } from '$lib/store'
	import { SubscribeInviteForm } from '$lib/subscribe'
	import PeriodSubscribes from './PeriodSubscribes.svelte'
	import Progress from '$lib/Progress.svelte'

	type _Period = Partial<Period & { subscribes: Subscribe[] }>
	type MemberWithUser = Member & { user: User }

	export let period: _Period | null | undefined = undefined

	export function selectMember(m: MemberWithUser) {
		member = m
	}

	let member: MemberWithUser | null = null

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
	title="{period?.id ? 'Édition' : 'Création'} d'une période"
	bind:transitionX={$periodDrawerTransitionX}
>
	<PeriodForm {period} />

	{#if period?.id}
		<div class="divider" />

		<div class="flex flex-col gap-2">
			{#if period.subscribes && period.maxSubscribe}
				<Progress
					period={{ maxSubscribe: period.maxSubscribe, subscribes: period.subscribes }}
					withLabel
				/>
				<PeriodSubscribes subscribes={period.subscribes} />
			{/if}

			{#if period.id && !periodIsComplet(period)}
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

<script lang="ts">
	import type { PageData } from './$types'
	import { page } from '$app/stores'
	import { Icon, formatRange, urlParam } from 'fuma'
	import { eventPath, onlyAvailable } from '$lib/store'
	import { createEventDispatcher } from 'svelte'
	import { SubscribeStateForm, SubscribesOfPeriod } from '$lib/subscribe'
	import Progress from '$lib/Progress.svelte'
	import { goto } from '$app/navigation'
	import { mdiClipboardTextOutline } from '@mdi/js'
	import { slide } from 'svelte/transition'
	type P = PageData['team']['periods'][number]

	export let period: P
	export let isTeamClosedSubscribing: boolean
	const PERIOD_OPEN_KEY = 'periodOpen'

	$: isOpen = $urlParam.hasValue(PERIOD_OPEN_KEY, period.id)
	$: state = getPeriodComputedState(period)
	function getPeriodComputedState(p: P) {
		const data = $page.data as PageData

		const nbSubscribe = p.subscribes.filter(
			(sub) => sub.state === 'accepted' || sub.state === 'request'
		).length
		const mySubscribe = p.subscribes.find((sub) => sub.memberId === data.member?.id)
		const isComplete = nbSubscribe >= p.maxSubscribe
		const available = !mySubscribe && !isComplete

		let disabled = true
		if (data.isLeaderOfTeam) disabled = false
		if (available && data.event.selfSubscribeAllowed && !isTeamClosedSubscribing) {
			if (data.member) disabled = false
			if (!data.member && data.event.selfRegisterAllowed) disabled = false
		}

		return {
			mySubscribe,
			available,
			isComplete,
			disabled,
		}
	}

	const dispatch = createEventDispatcher<{ subscribe: P }>()

	function handlePeriodClick() {
		if ($page.data.isLeaderOfTeam) {
			const url = $urlParam.with({ [PERIOD_OPEN_KEY]: period.id })
			return goto(url, { replaceState: true, noScroll: true })
		}
		if (!state.disabled) handleSubscribeClick()
	}

	function handleSubscribeClick() {
		if (!$page.data.member?.isValidedByUser) {
			const redirectTo = encodeURIComponent(`${location.pathname}?subscribeTo=${period.id}`)
			return goto(`${$eventPath}/register?redirectTo=${redirectTo}`)
		}
		dispatch('subscribe', period)
	}
</script>

{#if !$onlyAvailable || !state.isComplete}
	<tr
		class:hover={!state.disabled}
		class:cursor-pointer={!state.disabled}
		class:border-0={$urlParam.hasValue(PERIOD_OPEN_KEY, period.id)}
		on:click={handlePeriodClick}
	>
		<td class="w-full font-medium" class:opacity-80={state.disabled}>
			{formatRange(period)}
		</td>
		<td class="flex flex-wrap md:flex-nowrap gap-2 items-center justify-end">
			{#if state.mySubscribe}
				<SubscribeStateForm subscribe={state.mySubscribe} isLeader={!!$page.data.isLeaderOfTeam} />
			{/if}

			<Progress {period} class="w-[60px]" />

			{#if $page.data.isLeaderOfTeam}
				<div class="flex gap-2">
					{#if state.available}
						<button class="btn btn-square btn-sm" on:click|stopPropagation={handleSubscribeClick}>
							<Icon path={mdiClipboardTextOutline} size={20} title="M'inscrire à cette période" />
						</button>
					{:else}
						<div class="w-8" />
					{/if}
				</div>
			{/if}
		</td>
	</tr>

	<tr class:border-0={!isOpen}>
		<td class="py-0" colspan="3">
			{#if isOpen}
				<div class="py-3 pl-6" transition:slide>
					<SubscribesOfPeriod subscribes={period.subscribes} />
				</div>
			{/if}
		</td>
	</tr>
{/if}

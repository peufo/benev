<script lang="ts">
	import {
		mdiClipboardTextOutline,
		mdiAccountMultipleOutline,
		mdiChartGantt,
		mdiChevronRight,
		mdiClipboardTextMultipleOutline,
		mdiClockTimeFourOutline,
		mdiPencilOutline,
		mdiFilterOutline,
	} from '@mdi/js'

	import dayjs from 'dayjs'
	import { onMount } from 'svelte'
	import { Card, Icon, Placeholder } from 'fuma'
	import { goto } from '$app/navigation'

	import { ToggleOnlyAvailable } from '$lib/material/display'
	import { eventPath, urlParam, onlyAvailable } from '$lib/store'
	import { formatRange } from '$lib/formatRange'
	import { SubscribeForm, SubscribeStateForm, SubscribesOfPeriod } from '$lib/subscribe'
	import ThanksDialog from './ThanksDialog.svelte'
	import Leaders from '$lib/Leaders.svelte'
	import Progress from '$lib/Progress.svelte'
	import { slide } from 'svelte/transition'
	import PeriodEditMenu from '$lib/PeriodEditMenu.svelte'
	import { page } from '$app/stores'
	import RowPeriod from './RowPeriod.svelte'

	export let data

	let subscribeDialog: HTMLDialogElement
	let thanksDialog: ThanksDialog
	type _Period = (typeof data.team.periods)[number]
	let selectedPeriod: _Period | undefined = undefined

	const periodOpenKey = 'periodOpen'

	function handlePeriodClick(period: _Period & { disabled: boolean }) {
		if (data.isLeaderOfTeam) return goto(`${$eventPath}/teams/${period.teamId}/${period.id}`)
		if (!period.disabled) subscribe(period)
	}

	function subscribe(period: _Period) {
		if (!data.member?.isValidedByUser) {
			const redirectTo = encodeURIComponent(`${location.pathname}?subscribeTo=${period.id}`)
			return goto(`${$eventPath}/register?redirectTo=${redirectTo}`)
		}
		selectedPeriod = period
		subscribeDialog?.showModal()
	}

	const closeSubscribing = data.team.closeSubscribing || data.event.closeSubscribing
	const DAY = 1000 * 60 * 60 * 24
	const isTeamClosedSubscribing =
		!!closeSubscribing && closeSubscribing.getTime() < new Date().getTime() + DAY

	onMount(() => {
		const subscribeTo = $page.url.searchParams.get('subscribeTo')
		if (!subscribeTo) return
		const period = data.team.periods.find((p) => p.id === subscribeTo)
		if (!period) return
		selectedPeriod = period
		subscribeDialog?.showModal()
	})

	$: _periods = data.team.periods
		.map((period) => {
			const nbSubscribe = period.subscribes.filter(
				(sub) => sub.state === 'accepted' || sub.state === 'request'
			).length
			const mySubscribe = period.subscribes.find((sub) => sub.memberId === data.member?.id)
			const isComplete = nbSubscribe >= period.maxSubscribe
			const available = !mySubscribe && !isComplete

			let disabled = true
			if (data.isLeaderOfTeam) disabled = false
			if (available && data.event.selfSubscribeAllowed && !isTeamClosedSubscribing) {
				if (data.member) disabled = false
				if (!data.member && data.event.selfRegisterAllowed) disabled = false
			}

			return {
				...period,
				mySubscribe,
				available,
				isComplete,
				disabled,
			}
		})
		.filter((period) => !$onlyAvailable || !period.isComplete)
</script>

<Card class="max-w-4xl m-auto" returnUrl="{$eventPath}/teams">
	<h2 slot="title">{data.team.name}</h2>
	<div slot="subtitle">
		{data.team.description || ''}

		{@const closeSubscribing = data.team.closeSubscribing || data.event.closeSubscribing}
		<div class="flex gap-2">
			{#if data.event.selfSubscribeAllowed && closeSubscribing}
				<span>Fin des inscriptions: </span>

				<span class="badge" class:badge-warning={isTeamClosedSubscribing}>
					<Icon path={mdiClockTimeFourOutline} size={16} />
					<span class="ml-1">
						{dayjs(closeSubscribing).format('DD MMMM YYYY')}
					</span>
				</span>
			{/if}
			{#if data.team.conditions?.length}
				<span class="badge">
					<Icon path={mdiFilterOutline} size={16} class="opacity-70" />
					<span class="ml-1">
						{data.team.conditions.length}
						condition{data.team.conditions.length > 1 ? 's' : ''}
					</span>
				</span>
			{/if}
		</div>
	</div>
	<div slot="action" class="flex gap-2">
		<ToggleOnlyAvailable />

		{#if data.isLeaderOfTeam}
			<a
				href={`${$eventPath}/admin/members?subscribes_teams=["${data.team.id}"]`}
				class="btn btn-square btn-sm"
			>
				<Icon path={mdiAccountMultipleOutline} title="Tous les membres du secteur" />
			</a>
			<a
				href={`${$eventPath}/admin/subscribes?teams=["${data.team.id}"]`}
				class="btn btn-square btn-sm"
			>
				<Icon
					path={mdiClipboardTextMultipleOutline}
					title="Toutes les inscriptions du secteur"
					size={20}
				/>
			</a>
			<a href={`${$eventPath}/admin/plan?teams=["${data.team.id}"]`} class="btn btn-square btn-sm">
				<Icon path={mdiChartGantt} title="Voir le planning du secteur" />
			</a>

			<a href="{$eventPath}/teams/{data.team.id}/edit" class="btn btn-square btn-sm">
				<Icon path={mdiPencilOutline} title="Éditer ce secteur" />
			</a>

			<PeriodEditMenu />
		{/if}
	</div>

	<Leaders leaders={data.team.leaders} />

	{#if _periods.length}
		<table class="table text-sm">
			<thead>
				<tr>
					<th>Période de travail</th>
					<th>Bénévoles</th>
				</tr>
			</thead>

			<tbody>
				{#each _periods as period (period.id)}
					<RowPeriod {period} {isTeamClosedSubscribing} />
				{/each}
			</tbody>
		</table>
	{:else}
		<Placeholder>Aucune période de travail</Placeholder>
	{/if}
</Card>

<dialog class="modal" bind:this={subscribeDialog}>
	{#if selectedPeriod && data.member}
		<SubscribeForm
			memberId={data.member.id}
			team={data.team}
			period={selectedPeriod}
			on:close={() => {
				subscribeDialog.close()
				if ($page.url.searchParams.has('subscribeTo'))
					goto($urlParam.without('subscribeTo'), { replaceState: true })
			}}
			on:success={() => {
				subscribeDialog.close()
				thanksDialog.open()
			}}
		/>
	{/if}
</dialog>

<ThanksDialog bind:this={thanksDialog} />

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
	const isCloseSubscribing =
		closeSubscribing && closeSubscribing.getTime() < new Date().getTime() + DAY

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
			if (available && data.event.selfSubscribeAllowed && !isCloseSubscribing) {
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

				<span class="badge" class:badge-warning={isCloseSubscribing}>
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
					{@const isOpen = $urlParam.hasValue(periodOpenKey, period.id)}

					<tr
						class:hover={!period.disabled}
						class:cursor-pointer={!period.disabled}
						class:border-0={$urlParam.hasValue(periodOpenKey, period.id)}
						on:click={() => handlePeriodClick(period)}
					>
						<td class="w-full font-medium" class:opacity-80={period.disabled}>
							{formatRange(period)}
						</td>
						<td class="flex flex-wrap md:flex-nowrap gap-2 items-center justify-end">
							{#if period.mySubscribe}
								<SubscribeStateForm
									subscribe={period.mySubscribe}
									isLeader={!!data.isLeaderOfTeam}
								/>
							{/if}

							<Progress {period} class="w-[60px]" />

							{#if data.isLeaderOfTeam}
								<div class="flex gap-2">
									{#if period.available}
										<button
											class="btn btn-square btn-sm"
											on:click|stopPropagation={() => subscribe(period)}
										>
											<Icon
												path={mdiClipboardTextOutline}
												size={20}
												title="M'inscrire à cette période"
											/>
										</button>
									{:else}
										<div class="w-8" />
									{/if}

									<button
										class="btn btn-square btn-sm"
										on:click|stopPropagation={() => {
											if ($urlParam.hasValue(periodOpenKey, period.id)) {
												goto($urlParam.without(periodOpenKey), {
													replaceState: true,
													noScroll: true,
												})
												return
											}
											goto($urlParam.with({ [periodOpenKey]: period.id }), {
												replaceState: true,
												noScroll: true,
											})
										}}
									>
										<Icon
											path={mdiChevronRight}
											class=" transition-transform
											{$urlParam.hasValue(periodOpenKey, period.id) ? 'rotate-90' : ''}
										"
										/>
									</button>
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

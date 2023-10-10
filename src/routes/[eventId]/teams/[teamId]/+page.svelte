<script lang="ts">
	import { Card, Icon, Placeholder } from '$lib/material'
	import {
		mdiAccountArrowUpOutline,
		mdiAccountMultipleOutline,
		mdiChevronRight,
		mdiClipboardTextMultipleOutline,
		mdiPencilOutline,
	} from '@mdi/js'

	import { goto } from '$app/navigation'
	import { eventPath, urlParam } from '$lib/store'
	import { formatRange } from '$lib/formatRange'
	import PeriodForm from './[periodId]/PeriodForm.svelte'
	import SubscribeForm from './SubscribeForm.svelte'
	import ThanksDialog from './ThanksDialog.svelte'
	import Subscribes from './Subscribes.svelte'
	import Leaders from '$lib/Leaders.svelte'
	import MemberForm from '$lib/MemberForm.svelte'
	import MemberProfileForm from '$lib/member/MemberProfileForm.svelte'
	import Progress from '$lib/Progress.svelte'
	import { slide } from 'svelte/transition'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'

	export let data

	let subscribeDialog: HTMLDialogElement
	let memberDialog: HTMLDialogElement
	let memberProfilDialog: HTMLDialogElement
	let thanksDialog: ThanksDialog
	type _Period = (typeof data.team.periods)[number]
	let selectedPeriod: _Period | undefined = undefined

	const periodOpenKey = 'periodOpen'

	function subscribe(period: _Period) {
		if (!data.user) return goto(`/${data.event.id}/me?callback=${location.pathname}`)

		selectedPeriod = period
		if (!data.member) {
			memberDialog?.showModal()
		} else {
			subscribeDialog?.showModal()
		}
	}
</script>

<Card class="max-w-4xl m-auto" returnUrl="{$eventPath}/teams">
	<h2 slot="title">{data.team.name}</h2>
	<p slot="subtitle">
		{data.team.description || ''}
	</p>
	<div slot="action">
		{#if data.isLeader}
			<a
				href={`${$eventPath}/admin/manage/members?teams=["${data.team.id}"]`}
				class="btn btn-square btn-sm"
			>
				<Icon path={mdiAccountMultipleOutline} title="Tous les membres du secteur" />
			</a>
			<a
				href={`${$eventPath}/admin/manage/subscribes?teams=["${data.team.id}"]`}
				class="btn btn-square btn-sm"
			>
				<Icon path={mdiClipboardTextMultipleOutline} title="Toutes les inscriptions du secteur" />
			</a>

			<a href="{$eventPath}/teams/{data.team.id}/edit" class="btn btn-square btn-sm">
				<Icon path={mdiPencilOutline} title="Éditer ce secteur" />
			</a>
		{/if}
	</div>

	<Leaders leaders={data.team.leaders} />

	{#if data.team.periods.length}
		<table class="table text-sm">
			<thead>
				<tr>
					<th>Période de travail</th>
					<th>Bénévoles</th>
				</tr>
			</thead>

			<tbody>
				{#each data.team.periods as period}
					{@const isOpen = $urlParam.hasValue(periodOpenKey, period.id)}
					{@const nbSubscribe = period.subscribes.filter((sub) => sub.state !== 'denied').length}
					{@const mySubscribe = period.subscribes.find((sub) => sub.memberId === data.member?.id)}
					{@const isComplet = nbSubscribe >= period.maxSubscribe}
					{@const available = !mySubscribe && !isComplet}
					{@const disabled = !data.isLeader && !available}
					<tr
						class:hover={!disabled}
						class:cursor-pointer={!disabled}
						class:border-0={$urlParam.hasValue(periodOpenKey, period.id)}
						on:click={() => {
							if (data.isLeader) return goto(`${$eventPath}/teams/${period.teamId}/${period.id}`)
							if (!disabled) subscribe(period)
						}}
					>
						<td class="w-full font-medium" class:opacity-70={disabled}>
							{formatRange(period)}
						</td>
						<td class="flex flex-wrap md:flex-nowrap gap-2 items-center justify-end">
							{#if mySubscribe}
								<SubscribeStateForm subscribe={mySubscribe} isLeader={!!data.isLeader} />
							{/if}

							<Progress {period} class="w-[60px]" />

							{#if data.isLeader}
								<div class="flex gap-2">
									{#if available}
										<button
											class="btn btn-square btn-sm"
											on:click|stopPropagation={() => subscribe(period)}
										>
											<Icon
												path={mdiAccountArrowUpOutline}
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
												goto($urlParam.without(periodOpenKey), { replaceState: true })
												return
											}
											goto($urlParam.with({ [periodOpenKey]: period.id }), { replaceState: true, noScroll: true })
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
									<Subscribes subscribes={period.subscribes} />
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

{#if data.isLeader}
	<div class="p-4 card bg-base-100 max-w-4xl m-auto mt-4">
		<PeriodForm />
	</div>
{/if}

<dialog class="modal" bind:this={memberDialog}>
	{#if data.user}
		<MemberForm
			userId={data.user.id}
			event={data.event}
			on:close={() => memberDialog.close()}
			on:success={() => {
				memberDialog.close()
				if (data.event.memberFields.filter((f) => f.memberCanWrite).length)
					memberProfilDialog.showModal()
				else subscribeDialog.showModal()
			}}
		/>
	{/if}
</dialog>

<dialog class="modal" bind:this={memberProfilDialog}>
	<div class="modal-box">
		<h3 class="card-title mb-2">Complète ton profile {data.event.name}</h3>
		<MemberProfileForm
			event={data.event}
			fieldsValue={[]}
			class="sm:grid-cols-1 md:grid-cols-1"
			writeOnly
			on:success={() => {
				memberProfilDialog.close()
				subscribeDialog.showModal()
			}}
		/>
	</div>
</dialog>

<dialog class="modal" bind:this={subscribeDialog}>
	{#if selectedPeriod && data.member}
		<SubscribeForm
			memberId={data.member.id}
			team={data.team}
			period={selectedPeriod}
			on:close={() => subscribeDialog.close()}
			on:success={() => {
				subscribeDialog.close()
				thanksDialog.open()
			}}
		/>
	{/if}
</dialog>

<ThanksDialog bind:this={thanksDialog} />

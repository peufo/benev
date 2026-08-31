<script lang="ts">
	import { resolve } from '$app/paths'
	import { onMount } from 'svelte'
	import { InputSearch } from '$lib/ui'
	import { Dialog, RangePickerButton, urlParam } from 'fuma'

	import { Teams, ToggleOnlyAvailable } from '$lib/team'
	import ThanksDialog from './ThanksDialog.svelte'
	import { SubscribeForm } from '$lib/subscribe'
	import { memberIsRegistered } from '$lib/member'
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { goto } from '$app/navigation'
	import { eventPath, withSearch } from '$lib/eventPath'
	import { page } from '$app/state'
	import TeamsStats from './TeamsStats.svelte'

	let { data } = $props()

	let subscribeDialog: HTMLDialogElement = $state()!
	let thanksDialog: ThanksDialog = $state()!

	type PeriodWithTeam = PeriodWithComputedValues & { team: TeamWithComputedValues }
	let selectedPeriod: PeriodWithTeam | undefined = $state(undefined)

	function handleClickPeriod(period: PeriodWithTeam) {
		if (period.isDisabled) return
		// Adhésion à faire, ou profil incomplet: le tunnel reprend la main. Le `subscribeTo` du
		// `redirectTo` fait rouvrir ce dialogue-ci au retour, sur la même période.
		if (!memberIsRegistered(data.member)) {
			const redirectTo = encodeURIComponent(`${location.pathname}?subscribeTo=${period.id}`)
			return goto(eventPath(`/register?redirectTo=${redirectTo}`))
		}
		selectedPeriod = period
		subscribeDialog?.showModal()
	}

	onMount(() => {
		const subscribeTo = page.url.searchParams.get('subscribeTo')
		if (!subscribeTo) return
		const period = data.teams
			.map((t) => t.periods)
			.flat()
			.find((p) => p.id === subscribeTo)
		if (!period) return
		const team = data.teams.find((t) => t.id === period.teamId)
		if (!team) return
		selectedPeriod = { ...period, team }
		subscribeDialog?.showModal()
	})
</script>

<div class="max-w-xl m-auto flex flex-col gap-3 mb-20">
	<div class="surface flex flex-col gap-2 p-2">
		<div class="flex gap-1">
			<InputSearch />
			<div class="grow"></div>
			<RangePickerButton key="range" />
			<ToggleOnlyAvailable />
		</div>

		<TeamsStats teams={data.teams} />
	</div>

	<Teams teams={data.teams} onclickPeriod={(detail) => handleClickPeriod(detail)}>
		{#snippet placeholder()}
			{#if !data.user && data.teamsHiddenCount}
				<div class="grid place-content-center p-10 gap-4">
					<p>Pas de secteur publique</p>
					<a
						href={withSearch(resolve('/auth'), `redirectTo=${eventPath('/teams')}`)}
						class="btn btn-primary"
					>
						Connexion
					</a>
				</div>
			{:else}
				<span>Pas de secteur</span>
			{/if}
		{/snippet}
	</Teams>
</div>

<Dialog bind:dialog={subscribeDialog}>
	{#snippet header()}
		<span class="title">Nouvelle inscription</span>
	{/snippet}

	{#if selectedPeriod && data.member}
		<SubscribeForm
			memberId={data.member.id}
			team={selectedPeriod.team}
			period={selectedPeriod}
			onclose={() => {
				subscribeDialog.close()
				if (page.url.searchParams.has('subscribeTo'))
					goto(urlParam.without('subscribeTo'), { replaceState: true })
			}}
			onsuccess={() => {
				subscribeDialog.close()
				thanksDialog.open()
			}}
		/>
	{/if}
</Dialog>

<ThanksDialog bind:this={thanksDialog} />

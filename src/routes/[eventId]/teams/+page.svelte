<script lang="ts">
	import { mdiPencilOutline, mdiPlus } from '@mdi/js'
	import { onMount } from 'svelte'
	import { Drawer, Icon, InputSearch, urlParam } from 'fuma'

	import { Teams, ToggleOnlyAvailable } from '$lib/team'
	import ThanksDialog from './ThanksDialog.svelte'
	import { SubscribeForm } from '$lib/subscribe'
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { goto } from '$app/navigation'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import TeamsOrder from '$lib/team/TeamsOrder.svelte'

	export let data

	let subscribeDialog: HTMLDialogElement
	let thanksDialog: ThanksDialog

	type PeriodWithTeam = PeriodWithComputedValues & { team: TeamWithComputedValues }
	let selectedPeriod: PeriodWithTeam | undefined = undefined

	function handleClickPeriod(period: PeriodWithTeam) {
		if (!data.member?.isValidedByUser) {
			const redirectTo = encodeURIComponent(`${location.pathname}?subscribeTo=${period.id}`)
			return goto(`${$eventPath}/register?redirectTo=${redirectTo}`)
		}
		selectedPeriod = period
		subscribeDialog?.showModal()
	}

	onMount(() => {
		const subscribeTo = $page.url.searchParams.get('subscribeTo')
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

<div class="max-w-xl m-auto flex flex-col gap-4">
	<div class="flex gap-2 p-2 bg-base-100 rounded-2xl">
		<InputSearch />
		<div class="grow" />
		<ToggleOnlyAvailable />

		{#if data.member?.roles.includes('admin')}
			<a
				href={$urlParam.with({ teams_order: 1 })}
				class="btn btn-sm btn-square"
				data-sveltekit-noscroll
				data-sveltekit-replacestate
			>
				<Icon path={mdiPencilOutline} title="Modifier l'ordre des secteur" />
			</a>
			<a
				href={$urlParam.with({ form_team: 1 })}
				class="btn btn-sm btn-square"
				data-sveltekit-noscroll
				data-sveltekit-replacestate
			>
				<Icon path={mdiPlus} title="Nouveau secteur" />
			</a>
		{/if}
	</div>

	<Teams teams={data.teams} on:clickPeriod={({ detail }) => handleClickPeriod(detail)} />
</div>

<dialog class="modal" bind:this={subscribeDialog}>
	{#if selectedPeriod && data.member}
		<SubscribeForm
			memberId={data.member.id}
			team={selectedPeriod.team}
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

{#if data.member?.roles.includes('admin')}
	<Drawer key="teams_order" title="Ordre des secteurs" classBody="my-4" maxWidth="350px">
		<TeamsOrder teams={data.allTeams} />
	</Drawer>
{/if}

<script lang="ts">
	import { mdiClockTimeFourOutline, mdiFilterOutline, mdiShieldAccountOutline } from '@mdi/js'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { page } from '$app/stores'
	import Progress from '$lib/Progress.svelte'
	import { formatRangeDate } from '$lib/formatRange'
	import type { TeamWithComputedValuesAndLeaders } from '$lib/server'
	dayjs.locale('fr-ch')

	import { CardCollapse, Icon, tip } from 'fuma'
	import { derived } from 'svelte/store'
	import TeamActions from './TeamActions.svelte'
	export let team: TeamWithComputedValuesAndLeaders

	const canEditTeam = derived(page, ({ data: { member } }) => {
		if (!member) return () => false
		const leaderOf = member.leaderOf.map((t) => t.id)
		return member.roles.includes('admin') || leaderOf.includes(team.id)
	})
</script>

<CardCollapse value={team.id} class="p-1 md:py group" classHeader="sm:pr-3">
	<svelte:fragment slot="header">
		<div class="flex gap-2">
			<h2 class="title-md text-base-content">{team.name}</h2>
			<Progress
				class="mt-1 grow max-w-[50%] ml-auto"
				period={{
					maxSubscribe: team.maxSubscribes,
					subscribes: team.periods.map((p) => p.subscribes).flat(),
				}}
			/>
		</div>

		<div class="flex flex-wrap gap-2 items-center">
			<p class="text-xs opacity-60 font-semibold mt-1 mb-2">
				{team.range ? formatRangeDate(team.range) : 'Pas de périodes de travail'}
			</p>

			{#if $canEditTeam}
				<div class="flex gap-2 ml-auto">
					<TeamActions {team} />
				</div>
			{/if}
		</div>
	</svelte:fragment>

	{#if team.description}
		<p class="text-sm">{team.description}</p>
	{/if}

	<div class="flex gap-2 flex-wrap">
		<!-- BADGES LEADERS -->
		{#each team.leaders as leader (leader.id)}
			{@const { user } = leader}
			<span
				class="badge opacity-80"
				use:tip={{ content: `${user.firstName} est responsable du secteur "${team.name}"` }}
			>
				<Icon path={mdiShieldAccountOutline} size={16} />
				<span class="ml-1">
					{user.firstName}
					{user.lastName}
				</span>
			</span>
		{/each}

		<!-- BADGE SUBSCRIBE CLOSED -->
		{#if team.closeSubscribing && $page.data.event?.selfSubscribeAllowed}
			<span
				class="badge opacity-80"
				class:badge-warning={dayjs().isAfter(team.closeSubscribing)}
				use:tip={{
					content: `Fin des inscriptions le ${team.closeSubscribing.toLocaleDateString()}`,
				}}
			>
				<Icon path={mdiClockTimeFourOutline} size={16} />
				<span class="ml-1">
					{dayjs(team.closeSubscribing).format('DD MMMM')}
				</span>
			</span>
		{/if}
	</div>

	<div class="flex gap-2 items-center">
		<div class="grow" />

		{#if team.conditions?.length}
			<span class="badge opacity-80">
				<Icon path={mdiFilterOutline} size={16} />
				<span class="ml-1">
					{team.conditions.length}
					condition{team.conditions.length > 1 ? 's' : ''}
				</span>
			</span>
		{/if}
	</div>
</CardCollapse>

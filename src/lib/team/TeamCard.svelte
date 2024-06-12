<script lang="ts">
	import { mdiClockTimeFourOutline, mdiFilterOutline, mdiShieldAccountOutline } from '@mdi/js'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { page } from '$app/stores'
	import Progress from '$lib/Progress.svelte'
	import { formatRangeDate } from '$lib/formatRange'
	import type { TeamWithComputedValues } from '$lib/server'
	dayjs.locale('fr-ch')
	import { CardCollapse, Icon, Placeholder, tip } from 'fuma'

	import TeamActions from './TeamActions.svelte'
	import TeamLeaders from './TeamLeaders.svelte'
	import { PeriodRow } from '$lib/period'
	export let team: TeamWithComputedValues
</script>

<CardCollapse value={team.id} class="p-1 md:py group max-w-xl" classHeader="sm:pr-3 sticky top-0">
	<svelte:fragment slot="header">
		<div class="flex gap-2">
			<h2 class="title-md text-base-content">{team.name}</h2>
			{#if team.isLeader}
				<div class="flex gap-2 ml-auto">
					<TeamActions {team} />
				</div>
			{/if}
		</div>

		<div class="flex flex-wrap gap-2 items-center">
			<span class="text-xs opacity-60 font-semibold mt-1 mb-2">
				{team.range ? formatRangeDate(team.range) : 'Pas de périodes de travail'}
			</span>
			<Progress
				class="mt-1 grow max-w-[50%] ml-auto"
				period={{
					maxSubscribe: team.maxSubscribes,
					subscribes: team.periods.map((p) => p.subscribes).flat(),
				}}
			/>
		</div>

		{#if team.description}
			<p class="text-sm my-4">{team.description}</p>
		{/if}

		<div class="flex gap-2 flex-wrap mt-4">
			<!-- BADGE LEADERS -->
			<TeamLeaders leaders={team.leaders} />

			<!-- BADGE SUBSCRIBE CLOSED -->
			{#if team.closeSubscribing && $page.data.event?.selfSubscribeAllowed}
				<span
					class="badge"
					class:badge-warning={team.isClosedSubscribing}
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

			<!-- BADGES CONDITIONS -->
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
	</svelte:fragment>

	<div>
		{#each team.periods as period (period.id)}
			<PeriodRow period={{ ...period, team }} on:clickPeriod />
		{:else}
			<Placeholder>Aucune période de travail</Placeholder>
		{/each}
	</div>
</CardCollapse>

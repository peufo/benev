<script lang="ts">
	import { mdiClockTimeFourOutline } from '@mdi/js'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { page } from '$app/stores'
	import Progress from '$lib/Progress.svelte'
	import { formatRangeDate } from '$lib/formatRange'
	import type { TeamWithComputedValues } from '$lib/server'
	dayjs.locale('fr-ch')
	import { CardCollapse, Icon, Placeholder } from 'fuma'

	import TeamActions from './TeamActions.svelte'
	import TeamLeaders from './TeamLeaders.svelte'
	import { PeriodRow } from '$lib/period'
	import { MemberConditionsBadges } from '$lib/member'
	export let team: TeamWithComputedValues
</script>

<CardCollapse value={team.id} class="p-1 md:py group" classHeader="sm:pr-3">
	<svelte:fragment slot="header">
		<div class="flex gap-2">
			<h2 class="title-md text-base-content">{team.name}</h2>

			<Progress
				badgeClass="ml-auto"
				class="mt-1 grow max-w-[50%] ml-auto"
				period={{
					maxSubscribe: team.periods.map((p) => p.maxSubscribe).reduce((acc, cur) => acc + cur, 0),
					subscribes: team.periods.map((p) => p.subscribes).flat(),
				}}
			/>
		</div>

		<div class="flex flex-wrap gap-2 items-center">
			<span class="text-sm font-semibold mt-1 mb-2">
				{team.range ? formatRangeDate(team.range) : 'Pas de périodes de travail'}
			</span>
		</div>

		<div class="flex flex-col gap-4 mt-4">
			{#if team.conditions?.length || (team.closeSubscribing && $page.data.event?.selfSubscribeAllowed)}
				<div class="flex gap-2 gap-y-1 flex-wrap">
					<!-- BADGE SUBSCRIBE CLOSED -->
					{#if team.closeSubscribing && $page.data.event?.selfSubscribeAllowed}
						<span class="badge" class:badge-warning={team.isClosedSubscribing}>
							<Icon path={mdiClockTimeFourOutline} size={16} />
							<span class="ml-1">
								Fin des inscriptions le {dayjs(team.closeSubscribing).format('DD MMMM YYYY')}
							</span>
						</span>
					{/if}

					<!-- BADGES CONDITIONS -->
					<MemberConditionsBadges
						conditions={team.conditions || []}
						memberFields={$page.data.member?.event.memberFields || []}
					/>
				</div>
			{/if}

			{#if team.description}
				<p class="text-sm">
					{@html team.description
						.replaceAll('\n', '<br>')
						.replaceAll(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '😇')}
				</p>
			{/if}

			<div>
				<span class="text-label text-xs">Responsable{team.leaders.length > 1 ? 's' : ''} : </span>
				<div class="flex gap-2 gap-y-1 flex-wrap">
					<!-- BADGE LEADERS -->
					<TeamLeaders leaders={team.leaders} />
					{#if team.isLeader}
						<div class="flex gap-2 ml-auto">
							<TeamActions {team} />
						</div>
					{/if}
				</div>
			</div>
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

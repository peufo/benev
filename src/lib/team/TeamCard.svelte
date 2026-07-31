<script lang="ts">
	import { mdiClockTimeFourOutline } from '@mdi/js'
	import { daytz } from '$lib/dayjs'
	import { page } from '$app/stores'
	import Progress from '$lib/Progress.svelte'
	import { formatRangeDate } from '$lib/formatRange'
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { CardCollapse, Icon, Placeholder } from '$lib/fuma-legacy'

	import TeamActions from './TeamActions.svelte'
	import TeamLeaders from './TeamLeaders.svelte'
	import { PeriodRow } from '$lib/period'
	import { MemberConditionsBadges } from '$lib/member'
	interface Props {
		team: TeamWithComputedValues
		onclickPeriod?: (value: PeriodWithComputedValues) => void
	}

	let { team, onclickPeriod }: Props = $props()
</script>

<CardCollapse value={team.id} class="p-1 md:py group" classHeader="sm:pr-3">
	{#snippet header()}
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
								Fin des inscriptions le {daytz(team.closeSubscribing).format('DD MMMM YYYY')}
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
				<!-- Description saisie librement par les responsables: rendue en texte
					     (échappée par Svelte), `whitespace-pre-line` conserve les retours ligne -->
				<p class="text-sm whitespace-pre-line">{team.description}</p>
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
	{/snippet}

	<div>
		{#each team.periods as period (period.id)}
			<PeriodRow period={{ ...period, team }} {onclickPeriod} />
		{:else}
			<Placeholder>Aucune période de travail</Placeholder>
		{/each}
	</div>
</CardCollapse>

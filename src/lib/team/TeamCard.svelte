<script lang="ts">
	import { page } from '$app/state'
	import Progress from '$lib/Progress.svelte'
	import { formatRangeDate } from '$lib/formatRange'
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { CardCollapse, Placeholder } from '$lib/ui'

	import TeamLeaders from './TeamLeaders.svelte'
	import TeamScheduleBadge from './TeamScheduleBadge.svelte'
	import { nextClose } from './teamSchedule'
	import { PeriodRow } from '$lib/period'
	import { MemberConditionsBadges } from '$lib/member'
	interface Props {
		team: TeamWithComputedValues
		onclickPeriod?: (value: PeriodWithComputedValues) => void
	}

	let { team, onclickPeriod }: Props = $props()

	let event = $derived(page.data.event)
</script>

<CardCollapse value={team.id} class="p-1 md:py group" classHeader="sm:pr-3">
	{#snippet header()}
		<div class="flex gap-2">
			<h2 class="title-md">{team.name}</h2>

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
				{team.range ? formatRangeDate(team.range) : 'Pas de créneaux'}
			</span>
		</div>

		<div class="flex flex-col gap-4 mt-4">
			{#if team.conditions?.length || (event && nextClose(team, event))}
				<div class="flex gap-2 gap-y-1 flex-wrap">
					{#if event}
						<TeamScheduleBadge {team} {event} />
					{/if}

					<!-- BADGES CONDITIONS -->
					<MemberConditionsBadges
						conditions={team.conditions || []}
						memberFields={page.data.member?.event.memberFields || []}
					/>
				</div>
			{/if}

			{#if team.description}
				<!-- Description saisie librement par les responsables: rendue en texte
					     (échappée par Svelte), `whitespace-pre-line` conserve les retours ligne -->
				<p class="text-sm whitespace-pre-line">{team.description}</p>
			{/if}

			<div class="border-t border-soft">
				<span class="label text-xs">Responsable{team.leaders.length > 1 ? 's' : ''} </span>
				<div class="flex gap-2 gap-y-1 flex-wrap">
					<!-- BADGE LEADERS -->
					<TeamLeaders leaders={team.leaders} />
				</div>
			</div>
		</div>
	{/snippet}

	<div>
		{#each team.periods as period (period.id)}
			<PeriodRow period={{ ...period, team }} {onclickPeriod} />
		{:else}
			<Placeholder>Aucun créneau</Placeholder>
		{/each}
	</div>
</CardCollapse>

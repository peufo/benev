<script lang="ts">
	import 'dayjs/locale/fr-ch'
	import { Icon, urlParam, type Range } from 'fuma'
	import { mdiPlus } from '@mdi/js'
	import TeamRow from '$lib/plan/TeamRow.svelte'
	import dayjs from 'dayjs'
	import type { Team } from '@prisma/client'
	import type { PeriodWithSubscribesUserName } from './types'
	import { getDays } from './getDays'
	import { keepScrollCenter } from './keepScrollCenter'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: PeriodWithSubscribesUserName[] })[]
	export let range: Range
	export let hourSize: number

	const TEAM_HEADER_WIDTH = 100
	const MIN_HOUR_WIDTH = 40

	$: hourSpan = Math.ceil(MIN_HOUR_WIDTH / hourSize)
	$: origin = dayjs(range.start).startOf('hour')
	$: days = getDays(range)
	$: totalWidth =
		TEAM_HEADER_WIDTH + days.reduce((acc, { hours }) => acc + hours.length, 0) * hourSize
</script>

<div
	class="overflow-auto bg-base-100/95 max-h-full"
	use:keepScrollCenter={{ scaleX: hourSize, marginX: TEAM_HEADER_WIDTH }}
>
	<!-- SCALE -->
	<div class="flex sticky top-0 z-10" style:margin-left="{TEAM_HEADER_WIDTH}px">
		{#each days as { date, hours }}
			<div class="bg-base-100/95">
				<!-- DAY -->
				<div
					style:left="{TEAM_HEADER_WIDTH}px"
					class="border-l font-medium sticky left-0 p-1 w-min whitespace-nowrap text-sm"
				>
					{date.format('dddd DD.MM')}
				</div>
				<!-- HOURS -->
				<div class="flex text-sm">
					{#each hours.filter((h, i) => !(i % hourSpan)) as hour}
						{@const isEndNextDay = hour + hourSpan > 24}
						{@const span = isEndNextDay ? 24 - hour : hourSpan}
						<div style:width="{hourSize * span}px" class="border-l px-1">
							{isEndNextDay ? '' : hour.toString().padStart(2, '0')}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#each teams as team}
		<div class="flex border-t" style:width="{totalWidth}px">
			<a
				href={$urlParam.with({ form_team: team.id })}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				style:width="{TEAM_HEADER_WIDTH}px"
				class="p-1 sticky shrink-0 left-0 bg-base-100/95 z-50 font-medium text-sm cursor-pointer hover:bg-base-200"
			>
				{team.name}
			</a>
			<TeamRow {team} {origin} {hourSize} />
		</div>
	{/each}

	<!-- CREATE TEAM -->
	<div style:width="{TEAM_HEADER_WIDTH}px" class="grid place-content-center p-4 sticky left-0">
		<a
			class="btn btn-square btn-sm"
			href={$urlParam.with({ form_team: 1 })}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
		>
			<Icon path={mdiPlus} title="Ajouter un secteur" />
		</a>
	</div>
	<div class="h-48" />
</div>

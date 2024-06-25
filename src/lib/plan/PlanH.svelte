<script lang="ts">
	import 'dayjs/locale/fr-ch'
	import type { Range } from 'fuma'
	import TeamRow from '$lib/plan/TeamRow.svelte'
	import dayjs from 'dayjs'
	import type { Team } from '@prisma/client'
	import type { PeriodWithSubscribesUserName } from './types'
	import { getDays } from './getDays'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: PeriodWithSubscribesUserName[] })[]
	export let range: Range
	export let msSize: number
	const TEAM_COLOMN_WIDTH = 100
	const MS_TO_HOUR = 3_600_000

	$: days = getDays(range)
	$: totalWidth =
		TEAM_COLOMN_WIDTH + days.reduce((acc, { hours }) => acc + hours.length, 0) * msSize * MS_TO_HOUR
</script>

<div class="overflow-auto bg-base-100/95 rounded">
	<div class="flex" style:margin-left="{TEAM_COLOMN_WIDTH}px">
		{#each days as { date, hours }}
			<div>
				<!-- DAY -->
				<div
					style:left="{TEAM_COLOMN_WIDTH}px"
					class="border-l font-medium sticky left-0 p-1 w-min whitespace-nowrap"
				>
					{date.format('dddd DD.MM')}
				</div>
				<!-- HOURS -->
				<div class="flex text-sm">
					{#each hours as hour}
						<div
							style:width="{msSize * MS_TO_HOUR}px"
							class="opacity-0 odd:opacity-100 border-l px-1"
						>
							{hour.toString().padStart(2, '0')}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#each teams as team}
		<div class="flex border-t" style:width="{totalWidth}px">
			<div
				style:width="{TEAM_COLOMN_WIDTH}px"
				class="p-1 sticky left-0 bg-base-100/95 z-50 font-medium"
			>
				{team.name}
			</div>
			<TeamRow {team} range={{ start: dayjs(range.start), end: dayjs(range.end) }} {msSize} />
		</div>
	{/each}
</div>

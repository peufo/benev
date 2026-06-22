<script lang="ts">
	import { Icon, urlParam, type Range } from 'fuma'
	import { mdiPlus } from '@mdi/js'
	import TeamRow from '$lib/plan/TeamRow.svelte'
	import { daytz } from '$lib/dayjs'
	import type { Team } from '@prisma/client'
	import type { PeriodWithMembers } from './types'
	import { getDays } from './getDays'
	import { keepScrollCenter } from './keepScrollCenter'
	import { scrollToPeriod } from './scrollToPeriod'
	import { usePositionIndicator } from './positionIndicator'

	export let teams: (Team & { periods: PeriodWithMembers[] })[]
	export let range: Range
	export let hourSize: number

	const TEAM_HEADER_WIDTH = 100
	const MIN_HOUR_WIDTH = 40

	const indicator = usePositionIndicator('x')

	$: hourSpan = Math.ceil(MIN_HOUR_WIDTH / hourSize)
	$: origin = daytz(range.start).startOf('hour')
	$: days = getDays(range)
	$: totalWidth =
		TEAM_HEADER_WIDTH + days.reduce((acc, { hours }) => acc + hours.length, 0) * hourSize
</script>

<div
	class="overflow-scroll bg-base-100 grow"
	use:scrollToPeriod={{ offsetX: -400, offsetY: -200 }}
	use:keepScrollCenter={{ scaleX: hourSize, marginX: TEAM_HEADER_WIDTH }}
	use:indicator.container
>
	<!-- SCALE -->
	<div
		class="sticky top-0 z-20 border-b bg-base-100 flex"
		style:width="{totalWidth}px"
		use:indicator.scale
	>
		<div
			class="sticky z-20 bg-base-100 left-0 border-r shrink-0"
			style:width="{TEAM_HEADER_WIDTH}px"
		/>

		{#each days as { date, hours }}
			<div class="-translate-x-[1px]">
				<!-- DAY -->
				<div
					style:left="{TEAM_HEADER_WIDTH}px"
					class="font-medium sticky border-l left-0 p-1 w-min whitespace-nowrap text-sm"
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

	{#each teams as team (team.id)}
		<div
			class="flex items-stretch border-b bg-base-100 hover:bg-accent/5 group/team"
			style:width="{totalWidth}px"
		>
			<a
				href={$urlParam.with({ form_team: team.id })}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				style:width="{TEAM_HEADER_WIDTH}px"
				class="
					p-1 sticky shrink-0 left-0 z-10 font-medium text-sm border-r
					cursor-pointer bg-base-100
					group-hover/team:bg-base-200 hover:underline
				"
			>
				{team.name}
			</a>
			<TeamRow bind:team {origin} {hourSize} />
		</div>
	{/each}

	<!-- CREATE TEAM -->
	<div style:width="{TEAM_HEADER_WIDTH}px" class="grid place-content-center p-4 sticky left-0">
		<a
			class="btn btn-square btn-sm"
			href={$urlParam.with({ form_team: '{}' })}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
		>
			<Icon path={mdiPlus} title="Ajouter un secteur" />
		</a>
	</div>
	<div class="h-48" />
</div>

<script lang="ts">
	import { daytz } from '$lib/dayjs'
	import { Icon, urlParam, type Range } from 'fuma'
	import type { Team } from '@prisma/client'
	import { getDays } from './getDays'
	import TeamCol from './TeamCol.svelte'
	import type { PeriodWithMembers } from './types'
	import { mdiPlus } from '@mdi/js'
	import { keepScrollCenter } from './keepScrollCenter'
	import { scrollToPeriod } from './scrollToPeriod'
	import { usePositionIndicator } from './positionIndicator'

	export let teams: (Team & { periods: PeriodWithMembers[] })[]
	export let range: Range
	export let hourSize: number

	const TEAM_HEADER_HEIGHT = 40
	const MIN_HOUR_HEIGHT = 30

	const indicator = usePositionIndicator('y')

	$: hourSpan = Math.ceil(MIN_HOUR_HEIGHT / hourSize)
	$: origin = daytz(range.start).startOf('hour')
	$: days = getDays(range)
	$: totalHeight =
		TEAM_HEADER_HEIGHT + days.reduce((acc, { hours }) => acc + hours.length, 0) * hourSize
</script>

<div
	class="overflow-scroll bg-base-100 grow flex"
	use:scrollToPeriod={{ offsetY: -100 }}
	use:keepScrollCenter={{ scaleY: hourSize, marginY: TEAM_HEADER_HEIGHT }}
	use:indicator.container
>
	<!-- SCALE -->
	<div
		class="sticky left-0 z-20 border-r bg-base-100"
		style:height="{totalHeight}px"
		use:indicator.scale
	>
		<div class="sticky z-20 bg-base-100 top-0 border-b" style:height="{TEAM_HEADER_HEIGHT}px" />

		{#each days as { date, hours }}
			<div class="flex items-start -translate-y-[1px]">
				<!-- DAY -->
				<div class="font-medium sticky border-t text-sm px-1 grow">
					<div class="text-sm font-medium whitespace-nowrap">
						{date.format('ddd D')}
					</div>
					<div class="text-xs">{date.format('MMMM')}</div>
				</div>
				<!-- HOURS -->
				<div class="flex flex-col items-end text-sm text-right">
					{#each hours.filter((h, i) => !(i % hourSpan)) as hour}
						{@const isEndNextDay = hour + hourSpan > 24}
						{@const span = isEndNextDay ? 24 - hour : hourSpan}
						<div style:height="{hourSize * span}px" class="border-t px-1">
							{isEndNextDay ? '' : hour.toString().padStart(2, '0')}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	{#each teams as team (team.id)}
		<div class="border-r hover:bg-accent/5 group/team" style:height="{totalHeight}px">
			<a
				href={$urlParam.with({ form_team: team.id })}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				style:height="{TEAM_HEADER_HEIGHT}px"
				class="
					px-1 sticky top-0 z-10 font-medium flex items-center border-b
					cursor-pointer bg-base-100
					group-hover/team:bg-base-200 hover:underline
				"
			>
				<span class="text-sm">
					{team.name}
				</span>
			</a>

			<TeamCol bind:team {origin} {hourSize} />
		</div>
	{/each}

	<!-- CREATE TEAM -->
	<div class="grid place-content-center px-4 sticky top-0" style:height="{TEAM_HEADER_HEIGHT}px">
		<a
			class="btn btn-square btn-sm"
			href={$urlParam.with({ form_team: '{}' })}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
		>
			<Icon path={mdiPlus} title="Ajouter un secteur" />
		</a>
	</div>
</div>

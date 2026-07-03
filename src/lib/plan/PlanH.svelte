<script lang="ts">
	import { tip, urlParam, type Range } from 'fuma'
	import { PinIcon, PlusIcon } from 'lucide-svelte'
	import type { Milestone, Team } from '@prisma/client'
	import { goto } from '$app/navigation'
	import TeamRow from '$lib/plan/TeamRow.svelte'
	import { daytz, type Dayjs } from '$lib/dayjs'
	import type { PeriodWithMembers } from './types'
	import { getDays } from './getDays'
	import { scrollOnWheel } from './scrollOnWheel'
	import { scrollToCursor } from './scrollToCursor'
	import { usePositionIndicator } from './positionIndicator'
	import { navigateOnScroll } from './navigateOnScroll'
	import { useGrabScale } from './grabScale'
	import { time } from './utils'

	export let teams: (Team & { periods: PeriodWithMembers[] })[]
	export let milestones: Milestone[] = []
	export let cursor: Dayjs
	export let range: Range
	export let hourSize: number

	function createMilestoneAt(event: MouseEvent) {
		const element = event.currentTarget as HTMLElement
		const offsetX = parseInt(element.style.translate) - TEAM_HEADER_WIDTH + element.offsetWidth / 2
		const timestamp = origin.add(offsetX / hourSize, 'hour').startOf('hour')
		goto($urlParam.with({ form_milestone: JSON.stringify({ timestamp: timestamp.toJSON() }) }), {
			replaceState: true,
			noScroll: true,
		})
	}

	const TEAM_HEADER_WIDTH = 100
	const MIN_HOUR_WIDTH = 40

	const indicator = usePositionIndicator('x')
	const grabScale = useGrabScale('x')

	$: hourSpan = Math.ceil(MIN_HOUR_WIDTH / hourSize)
	$: origin = daytz(range.start).startOf('hour')
	$: days = getDays(range)
	$: totalWidth =
		TEAM_HEADER_WIDTH + days.reduce((acc, { hours }) => acc + hours.length, 0) * hourSize
</script>

<div
	class="overflow-scroll bg-base-100 grow relative"
	use:scrollOnWheel={{ scaleX: hourSize, marginX: TEAM_HEADER_WIDTH }}
	use:scrollToCursor={{ cursor, axis: 'x', onScroll: grabScale.setScrollOrigin }}
	use:navigateOnScroll={{ cursor, axis: 'x' }}
	use:indicator.container
	use:grabScale.container
	style="
		scroll-padding-left: {TEAM_HEADER_WIDTH + 20}px;
		scroll-padding-top: 100px;
	"
>
	<!-- SCALE -->
	<div
		class="sticky top-0 z-20 border-b bg-base-100 flex cursor-grab"
		style:width="{totalWidth}px"
		use:grabScale.scale
	>
		<div class="bg-accent rounded w-[3px] h-8 bottom-0" use:indicator.element />

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
					p-1 sticky shrink-0 left-0 z-20 font-medium text-sm border-r
					cursor-pointer bg-base-100
					group-hover/team:bg-base-200 hover:underline
				"
			>
				{team.name}
			</a>
			<TeamRow bind:team {origin} {hourSize} />
		</div>
	{/each}

	<!-- BOTTOM ROW -->
	<div
		class="flex items-stretch border-b bg-base-200/40 group relative"
		style:width="{totalWidth}px"
	>
		<div
			style:width="{TEAM_HEADER_WIDTH}px"
			class="p-1 sticky shrink-0 left-0 z-10 font-medium text-sm border-r bg-base-100 flex items-center justify-around"
		>
			<a
				class="btn btn-sm btn-square"
				href={$urlParam.with({ form_team: '{}' })}
				data-sveltekit-replacestate
				data-sveltekit-noscroll
				use:tip={{ content: 'Ajouter un secteur' }}
			>
				<PlusIcon />
			</a>
		</div>

		<div class="w-full h-14 relative">
			{#each milestones as milestone (milestone.id)}
				{@const leftPx = time(hourSize).to('hour') * daytz(milestone.timestamp).diff(origin)}
				<span
					class="absolute w-px -left-[1px] bg-secondary/40 h-screen bottom-0"
					style:translate="{leftPx}px"
				/>
				<span
					class="absolute bottom-0 -left-[4.5px] w-2 h-2 rounded-full bg-secondary"
					style:translate="{leftPx}px"
				/>
				<div class="absolute top-1" style:translate="{leftPx}px">
					<a
						href={$urlParam.with({ form_milestone: milestone.id })}
						data-sveltekit-replacestate
						data-sveltekit-noscroll
						class="z-10 badge badge-secondary badge-outline bg-base-100 hover:ring-1 ring-secondary -translate-x-1/2"
					>
						{milestone.name}
					</a>
				</div>
			{/each}
		</div>
		<button
			class="btn btn-ghost btn-circle btn-xs opacity-0 group-hover:opacity-100 transition-opacity bottom-0"
			on:click={createMilestoneAt}
			use:indicator.element
			title="Ajouter un jalon"
		>
			<PinIcon size={16} class="translate-x-[3px] opacity-70" />
		</button>
	</div>

	<div class="h-48" />
</div>

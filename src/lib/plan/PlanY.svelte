<script lang="ts">
	import { tip, urlParam } from 'fuma'
	import { PlusIcon } from 'lucide-svelte'
	import type { Team } from '@prisma/client'
	import { afterNavigate } from '$app/navigation'
	import TeamCol from './TeamCol.svelte'
	import type { PeriodWithMembers, Plan } from './types'
	import { scrollOnZoom } from './scrollOnZoom'
	import { navigateOnScroll } from './navigateOnScroll'
	import { scrollOnNavigate } from './scrollOnNavigate'
	import { usePositionIndicator } from './positionIndicator'
	import { useGrabScale } from './grabScale'

	export let teams: (Team & { periods: PeriodWithMembers[] })[]
	export let plan: Plan

	let container: HTMLElement

	const TEAM_HEADER_HEIGHT = 40
	const MIN_HOUR_HEIGHT = 30

	const indicator = usePositionIndicator('y')
	const grabScale = useGrabScale('y')

	$: hourSpan = Math.ceil(MIN_HOUR_HEIGHT / plan.hourSize)
	$: totalHeight = TEAM_HEADER_HEIGHT + plan.length

	afterNavigate(async (navigation) => {
		scrollOnNavigate(navigation, {
			node: container,
			plan,
			onScroll: grabScale.setScrollOrigin,
		})
	})
</script>

<div
	class="overflow-scroll bg-base-100 grow flex"
	bind:this={container}
	use:scrollOnZoom={{
		scaleY: plan.hourSize,
		marginY: TEAM_HEADER_HEIGHT,
		onZoom({ scaleY }) {
			// Pas ouf mais j'en ai marre
			plan.hourSize = scaleY
			plan.length = plan.days.reduce((acc, { hours }) => acc + hours.length, 0) * plan.hourSize
		},
	}}
	use:navigateOnScroll={plan}
	use:indicator.container
	use:grabScale.container
>
	<!-- SCALE -->
	<div
		class="sticky left-0 z-20 border-r bg-base-100"
		style:height="{totalHeight}px"
		use:grabScale.scale
	>
		<div class="bg-accent rounded h-[3px] w-8 right-0" use:indicator.element />
		<div class="sticky z-20 bg-base-100 top-0 border-b" style:height="{TEAM_HEADER_HEIGHT}px" />

		{#each plan.days as { date, hours }}
			<div class="flex items-start -translate-y-[1px]">
				<!-- DAY -->
				<div
					style:top="{TEAM_HEADER_HEIGHT}px"
					class="font-medium sticky border-t text-sm px-1 grow"
				>
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
						<div style:height="{plan.hourSize * span}px" class="border-t px-1">
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

			<TeamCol bind:team {plan} />
		</div>
	{/each}

	<!-- CREATE TEAM -->
	<div class="grid place-content-center px-4 sticky top-0" style:height="{TEAM_HEADER_HEIGHT}px">
		<a
			class="btn btn-square btn-sm"
			href={$urlParam.with({ form_team: '{}' })}
			data-sveltekit-replacestate
			data-sveltekit-noscroll
			use:tip={{ content: 'Ajouter un secteur' }}
		>
			<PlusIcon />
		</a>
	</div>
</div>

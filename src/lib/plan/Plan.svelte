<script lang="ts">
	import dayjs, { type Dayjs } from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { Card } from '$lib/material'
	import { Period, Subscribe, Team } from '@prisma/client'
	import PeriodCard from './PeriodCard.svelte'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import { eventPath } from '$lib/store'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]

	let hourHeight = 40
	let containerWidth = 0

	const periods = teams
		.map(({ periods }) => periods.map((p) => [p.start.getTime(), p.end.getTime()]))
		.flat(2)
		.sort()

	const range = {
		start: dayjs(periods[0]).startOf('day'),
		end: dayjs(periods.at(-1)).endOf('day'),
	}

	const days: Dayjs[] = []
	for (let day = range.start; day.isBefore(range.end); day = day.add(1, 'day')) {
		days.push(day)
	}

	const hours = Array(24)
		.fill(0)
		.map((v, index) => (index + 1).toString().padStart(2, '0'))
</script>

<Card>
	<div class="flex">
		<WorkInProgress />
		<input type="number" class="input" bind:value={hourHeight} />
	</div>

	<div class="max-h-[615px] overflow-auto table-pin-cols snap-x scroll-pl-16 bordered">
		<div
			class="flex min-w-max pr-2 z-10"
			style="--container-width: {containerWidth}px;"
			bind:offsetWidth={containerWidth}
		>
			<div class="sticky left-0 z-20 bg-base-100">
				{#each days as day}
					<div class="w-16">
						<div
							class="sticky top-0 bg-base-100 pr-2 border-b border-r z-10"
							style:height="{hourHeight}px"
						>
							<div class="text-sm font-medium">{day.format('ddd D')}</div>
							<div class="text-xs">{day.format('MMMM')}</div>
						</div>
						<div>
							{#each hours.slice(0, 23) as hour}
								<div
									class="flex items-center bg-base-100 text-center font-light border-r"
									style:height="{hourHeight}px"
								>
									<span class="grow text-sm">
										{hour}
									</span>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="w-0">
				{#each days as day}
					{#each hours as hour}
						<div class="scale" style:height="{hourHeight}px" />
					{/each}
				{/each}
			</div>

			{#each teams as team}
				<div class="snap-start pl-2 relative">
					<div class="w-36 sticky top-0 pb-2 z-10" style:height="{hourHeight}px">
						<div
							class="relative flex items-center rounded bg-base-200 h-full px-2 outline outline-base-100"
						>
							<a href="{$eventPath}/teams/{team.id}" class="absolute inset-0">{' '}</a>
							<span class="overflow-hidden whitespace-nowrap text-ellipsis font-medium">
								{team.name}
							</span>
						</div>
					</div>

					{#each team.periods as period}
						<PeriodCard {period} origin={range.start} {hourHeight} />
					{/each}
				</div>
			{/each}
		</div>
	</div>
</Card>

<style>
	.scale {
		position: relative;
	}
	.scale::after {
		content: ' ';
		position: absolute;
		height: 100%;
		width: calc(var(--container-width) - 64px);
		border-bottom-width: 1px;
	}
</style>

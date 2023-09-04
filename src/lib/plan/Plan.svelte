<script lang="ts">
	import { Card } from '$lib/material'
	import { Period, Subscribe, Team } from '@prisma/client'
	import dayjs, { type Dayjs } from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import PeriodCard from './PeriodCard.svelte'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]

	let hourHeight = 40

	const periods = teams
		.map(({ periods }) => periods.map((p) => [p.start, p.end]))
		.flat(2)
		.sort()

	const range = {
		start: dayjs(periods.at(-1)).startOf('day'),
		end: dayjs(periods[0]).endOf('day'),
	}

	console.log({ range })

	const days: Dayjs[] = []
	for (let day = range.start; day.isBefore(range.end); day = day.add(1, 'day')) {
		days.push(day)
	}
</script>

<Card>
	<input type="number" class="input" bind:value={hourHeight} />

	<div class="max-h-[615px] overflow-auto table-pin-cols snap-x scroll-pl-16 bordered">
		<div class="flex min-w-max pr-2">
			<div class="sticky left-0 z-20 bg-base-100">
				{#each days as day}
					<div class="w-16">
						<div class="sticky top-0 bg-base-100 pr-2 border-b" style:height="{hourHeight}px">
							<div class="text-sm font-medium">{day.format('ddd D')}</div>
							<div class="text-xs">{day.format('MMMM')}</div>
						</div>
						<div>
							{#each Array(23).fill(0) as h, index}
								<div
									class="flex items-center bg-base-100 text-center font-light"
									style:height="{hourHeight}px"
								>
									<span class="grow pl-4 pr-1 text-sm">
										{(index + 1).toString().padStart(2, '0')}
									</span>
									<div class="w-4 border-b border-r h-full flex flex-col justify-evenly items-end">
										<div class="border-b w-1/3" />
										<div class="border-b w-1/2" />
										<div class="border-b w-1/3" />
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			{#each teams as team}
				<div class="snap-start pl-2 relative">
					<div class="w-52 sticky top-0 pb-2 z-10" style:height="{hourHeight}px">
						<div class="flex items-center rounded bg-base-200 h-full px-2">
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
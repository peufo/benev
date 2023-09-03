<script lang="ts">
	import { Card } from '$lib/material'
	import { Period, Subscribe, Team } from '@prisma/client'
	import dayjs, { type Dayjs } from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')

	export let teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]

	let rowHeight = 40

	let start = dayjs().startOf('day')
	const range = {
		start,
		end: start.add(10, 'day'),
	}

	const days: Dayjs[] = []
	for (let time = range.start; time.isBefore(range.end); time = time.add(1, 'day')) {
		days.push(time)
	}
</script>

<Card>
	<input type="number" bind:value={rowHeight} />

	<div class="max-h-[615px] overflow-auto table-pin-cols snap-x scroll-pl-16 bordered">
		<div class="flex min-w-max pr-2">
			<div class="sticky left-0 z-10 bg-base-100">
				{#each days as day}
					<div class="w-16">
						<div
							class="sticky top-0 bg-base-100 pr-2 border-b translate-y-px"
							style:height="{rowHeight}px"
						>
							<div class="text-sm font-medium">{day.format('ddd D')}</div>
							<div class="text-xs">{day.format('MMMM')}</div>
						</div>

						<div>
							{#each Array(23).fill(0) as h, index}
								<div
									class="flex items-center bg-base-100 text-center font-light"
									style:height="{rowHeight}px"
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
				<div class="snap-start pl-2">
					<div class="w-52 sticky top-0 pb-2" style:height="{rowHeight}px">
						<div class="flex items-center rounded bg-base-200 h-full px-2">
							<span class="overflow-hidden whitespace-nowrap text-ellipsis font-medium">
								{team.name}
							</span>
						</div>
					</div>

					{#each team.periods as period}
						<div class="bg-base-100">
							<div class="border rounded-md p-2">
								{period.subscribes.length} / {period.maxSubscribe}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</Card>

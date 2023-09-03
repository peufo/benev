<script lang="ts">
	import { Card } from '$lib/material'
	import dayjs, { type Dayjs } from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')

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
	<div class="max-h-[615px] overflow-auto table-pin-cols snap-x scroll-pl-16 bordered">
		<div class="flex min-w-max">
			<div class="sticky left-0 z-10 bg-base-100">
				{#each days as day}
					<div class="w-16">
						<div class="h-12 sticky top-0 bg-base-100 pr-2 border-b">
							<div class="text-sm font-medium">{day.format('ddd D')}</div>
							<div class="text-xs">{day.format('MMMM')}</div>
						</div>

						<div>
							{#each Array(24).fill(0) as h, index}
								<div class="h-8 flex items-center bg-base-100 text-center font-light">
									<span class="grow pl-4 pr-1 text-sm">{index + 1}</span>
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

			{#each Array(30).fill(0) as sector, index}
				<div class="snap-start px-2 inline-block">
					<div class="h-12 sticky top-0 bg-base-200 px-2 min-w-[160px] flex items-center rounded">
						Secteur {index}
					</div>
					<div class="bg-base-100">
						<div class="border rounded-md p-2">2 / 9</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</Card>

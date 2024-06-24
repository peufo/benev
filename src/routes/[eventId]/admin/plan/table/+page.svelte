<script lang="ts">
	import { getRangeOfTeams } from '$lib/plan'
	import type { Dayjs } from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { Card, RangePickerButton, type Range } from 'fuma'
	import TeamRow from '$lib/plan/TeamRow.svelte'
	import dayjs from 'dayjs'

	export let data

	// TODO: Set limit on PeriodPicker
	// TODO: PeriodPicker accept dayjs instances
	let rangeLimit = getRangeOfTeams(data.teams)
	let range: Range = { start: rangeLimit.start, end: rangeLimit.end }

	const hourWidth = 30 //px
	const teamColomnWidth = 100 //px

	let days: { hours: number[]; date: Dayjs }[] = []
	$: getDays(range)

	function getDays({ start, end }: Range) {
		days = []
		for (let day = dayjs(start); day.isBefore(end); day = day.add(1, 'day'))
			days.push({ date: day, hours: getHours(day) })
	}

	function getHours(date: Dayjs): number[] {
		if (!date.isSame(range.start, 'day') && !date.isSame(range.end, 'day'))
			return Array(24)
				.fill(0)
				.map((_, h) => h)

		const start = date.isSame(range.start, 'day') ? dayjs(range.start) : date.startOf('day')
		const end = date.isSame(range.end, 'day') ? dayjs(range.end) : date.endOf('day')
		const startHour = start.get('hour')
		const nbHours = end.diff(start, 'hours') + 1
		if (nbHours < 0) return []
		return Array(nbHours)
			.fill(0)
			.map((_, h) => startHour + h)
	}

	$: totalWidth =
		teamColomnWidth + days.reduce((acc, { hours }) => acc + hours.length, 0) * hourWidth
</script>

<Card class="overflow-scroll">
	<RangePickerButton bind:range />

	<div class="overflow-auto bg-base-100/95 rounded">
		<div class="flex" style:margin-left="{teamColomnWidth}px">
			{#each days as { date, hours }}
				<div>
					<!-- DAY -->
					<div
						style:left="{teamColomnWidth}px"
						class="border-l font-medium sticky left-0 p-1 w-min whitespace-nowrap"
					>
						{date.format('dddd DD.MM')}
					</div>
					<!-- HOURS -->
					<div class="flex text-sm">
						{#each hours as hour}
							<div style:width="{hourWidth}px" class="opacity-0 odd:opacity-100 border-l px-1">
								{hour.toString().padStart(2, '0')}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		{#each data.teams as team}
			<div class="flex border-t py-2" style:width="{totalWidth}px">
				<div
					style:width="{teamColomnWidth}px"
					class="p-1 sticky left-0 bg-base-100/95 z-50 font-medium"
				>
					{team.name}
				</div>
				<TeamRow
					{team}
					range={{ start: dayjs(range.start), end: dayjs(range.end) }}
					msWidth={hourWidth / (1000 * 60 * 60)}
				/>
			</div>
		{/each}
	</div>
</Card>

<script lang="ts">
	import { getRangeOfTeams } from '$lib/plan'
	import type { Dayjs } from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import { Card } from 'fuma'
	import TeamTableRow from './TeamTableRow.svelte'

	export let data

	let range = getRangeOfTeams(data.teams)
	let days: Dayjs[] = []

	for (let day = range.start; day.isBefore(range.end); day = day.add(1, 'day')) days.push(day)
</script>

<Card class="overflow-scroll">
	<table>
		<thead>
			<tr class="text-center">
				<td rowspan="3" />

				{#each days as day}
					<td colspan={288} class="border-l border-r">
						{day.format('dddd DD.MM')}
					</td>
				{/each}
			</tr>
			<tr class="text-center">
				{#each days as day}
					{#each Array(24) as _, index}
						<td colspan={12} class="border-l border-r">
							{(index + 1).toString().padStart(2, '0')}h
						</td>
					{/each}
				{/each}
			</tr>
			<tr>
				{#each days as day}
					{#each Array(24) as _}
						<td colspan={3} class="border-l border-r">00</td>
						<td colspan={3} class="border-l border-r">15</td>
						<td colspan={3} class="border-l border-r">30</td>
						<td colspan={3} class="border-l border-r">45</td>
					{/each}
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data.teams as team}
				<TeamTableRow {team} {range} />
			{/each}
		</tbody>
	</table>
</Card>

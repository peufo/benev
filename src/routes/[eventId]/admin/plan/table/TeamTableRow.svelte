<script lang="ts">
	import type { Period, Team } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import { isFreeRange } from 'perod'
	import Cells from './Cells.svelte'

	export let team: Team & { periods: Period[] }
	export let range: { start: Dayjs; end: Dayjs }

	const stacks: Period[][] = []
	team.periods.forEach((period) => {
		const stackIndex = getPeriodStackIndex(period)
		if (!stacks[stackIndex]) stacks[stackIndex] = []
		stacks[stackIndex].push(period)
	})
	const rowsNumber = stacks.map(getMaxSubscribe).reduce((acc, cur) => acc + cur, 0)

	function getPeriodStackIndex(period: Period, curentStackIndex = 0): number {
		const stack = stacks[curentStackIndex] || []
		if (isFreeRange(period, stack)) return curentStackIndex
		return getPeriodStackIndex(period, curentStackIndex + 1)
	}

	function getMaxSubscribe(periods: Period[]): number {
		return Math.max(...periods.map((p) => p.maxSubscribe))
	}
</script>

<tr>
	<td class="border-t border-b" rowspan={rowsNumber}>{team.name}</td>
	<Cells row={0} {range} periods={stacks[0]} />
</tr>

{#each stacks as periods, stackIndex}
	{#each Array(getMaxSubscribe(periods)).slice(stackIndex === 0 ? 1 : 0) as _, row}
		<tr>
			<Cells {row} {range} {periods} />
		</tr>
	{/each}
{/each}

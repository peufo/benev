<script lang="ts">
	import type { Period, Subscribe, Team } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import { isFreeRange } from 'perod'
	import PeriodCardH from '$lib/plan/PeriodCardH.svelte'
	import type { PeriodWithSubscribesUserName } from './types'

	export let team: Team & { periods: PeriodWithSubscribesUserName[] }
	export let range: { start: Dayjs; end: Dayjs }
	export let msWidth: number

	$: stacks = getStacks(team.periods)

	function getStacks(periods: PeriodWithSubscribesUserName[]): PeriodWithSubscribesUserName[][] {
		const _stacks: PeriodWithSubscribesUserName[][] = []

		function getPeriodStackIndex(period: Period, curentStackIndex = 0): number {
			const stack = _stacks[curentStackIndex] || []
			if (isFreeRange(period, stack)) return curentStackIndex
			return getPeriodStackIndex(period, curentStackIndex + 1)
		}

		periods.forEach((period) => {
			const stackIndex = getPeriodStackIndex(period)
			if (!_stacks[stackIndex]) _stacks[stackIndex] = []
			_stacks[stackIndex].push(period)
		})

		return _stacks
	}
</script>

<div class="pb-4">
	{#each stacks as periods}
		<div class="flex items-stretch">
			{#each periods as period (period.id)}
				<PeriodCardH start={range.start} {period} {msWidth} />
			{/each}
		</div>
	{/each}
</div>

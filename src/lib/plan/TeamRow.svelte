<script lang="ts">
	import type { Period, Subscribe, Team } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import { isFreeRange } from 'perod'
	import PeriodCardH from '$lib/plan/PeriodCardH.svelte'
	import type { PeriodWithSubscribesUserName } from './types'

	export let team: Team & { periods: PeriodWithSubscribesUserName[] }
	export let range: { start: Dayjs; end: Dayjs }
	export let msWidth: number

	const stacks: PeriodWithSubscribesUserName[][] = []
	team.periods.forEach((period) => {
		const stackIndex = getPeriodStackIndex(period)
		if (!stacks[stackIndex]) stacks[stackIndex] = []
		stacks[stackIndex].push(period)
	})

	function getPeriodStackIndex(period: Period, curentStackIndex = 0): number {
		const stack = stacks[curentStackIndex] || []
		if (isFreeRange(period, stack)) return curentStackIndex
		return getPeriodStackIndex(period, curentStackIndex + 1)
	}
	/*
	function getSlots(periods: Period[]): number {
		const maxSubscribe = Math.max(...periods.map((p) => p.maxSubscribe))
		return 0
	}
	*/
</script>

<div>
	{#each stacks as periods}
		<div class="flex">
			{#each periods as period}
				<PeriodCardH start={range.start} {period} {msWidth} />
			{/each}
		</div>
	{/each}
</div>

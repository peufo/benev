<script lang="ts">
	import type { Team } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import type { PeriodWithSubscribesUserName } from './types'
	import { getStacks } from './getStacks'
	import PeriodCardV from './PeriodCardV.svelte'
	import { createPeriod } from './createPeriod'

	export let team: Team & { periods: PeriodWithSubscribesUserName[] }
	export let msSize: number
	export let origin: Dayjs

	$: stacks = getStacks(team.periods)
</script>

<div
	class="pr-4 flex h-full"
	use:createPeriod={{
		axis: 'y',
		origin,
		msSize,
		team,
		isEnable: (target) => target.classList.contains('stack-col'),
	}}
>
	{#each stacks as periods}
		<div class="relative w-full min-w-24 stack-col">
			{#each periods as period (period.id)}
				<PeriodCardV {origin} {period} {msSize} />
			{/each}
		</div>
	{/each}
</div>

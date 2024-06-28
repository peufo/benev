<script lang="ts">
	import type { Team } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import PeriodCardH from '$lib/plan/PeriodCardH.svelte'
	import type { PeriodWithSubscribesUserName } from './types'
	import { getStacks } from './getStacks'
	import { createPeriod } from './createPeriod'

	export let team: Team & { periods: PeriodWithSubscribesUserName[] }
	export let hourSize: number
	export let origin: Dayjs

	$: stacks = getStacks(team.periods)
</script>

<div
	class="pb-4 w-full"
	use:createPeriod={{
		axis: 'x',
		origin,
		hourSize,
		team,
		isEnable: (target) => target.classList.contains('stack-row'),
	}}
>
	{#each stacks as periods}
		<div class="flex items-stretch stack-row">
			{#each periods as period (period.id)}
				<PeriodCardH {origin} {period} {hourSize} />
			{/each}
		</div>
	{/each}
</div>

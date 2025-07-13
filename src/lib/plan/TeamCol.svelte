<script lang="ts">
	import type { Team } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import type { PeriodWithMembers } from './types'
	import { getStacks } from './getStacks'
	import { createPeriod } from './createPeriod'
	import PeriodCard from './PeriodCard.svelte'

	export let team: Team & { periods: PeriodWithMembers[] }
	export let hourSize: number
	export let origin: Dayjs

	$: stacks = getStacks(team.periods)
</script>

<div
	class="pr-4 flex h-full"
	use:createPeriod={{
		axis: 'y',
		origin,
		hourSize,
		team,
		isEnable: (target) => target.classList.contains('stack-col'),
	}}
>
	{#each stacks as periods}
		<div class="relative w-full min-w-24 stack-col">
			{#each periods as period (period.id)}
				<PeriodCard
					{period}
					{hourSize}
					{origin}
					axis="y"
					drags={[
						{ class: 'left-1/2', axis: 'x', moveStart: true },
						{ class: 'left-1/2 top-full', axis: 'x', moveEnd: true },
						{ class: 'left-full top-1/2', moveStart: true, moveEnd: true },
					]}
				/>
			{/each}
		</div>
	{/each}
</div>

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
		<div class="flex items-stretch stack-row min-h-[30px]">
			{#each periods as period (period.id)}
				<PeriodCard
					{period}
					{hourSize}
					{origin}
					axis="x"
					drags={[
						{ class: 'top-1/2', axis: 'x', moveStart: true },
						{ class: 'left-full top-1/2', axis: 'x', moveEnd: true },
						{ class: 'left-1/2 top-full', moveStart: true, moveEnd: true },
					]}
				/>
			{/each}
		</div>
	{/each}
</div>

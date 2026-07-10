<script lang="ts">
	import type { Team } from '@prisma/client'
	import type { PeriodWithMembers, Plan } from './types'
	import { getStacks } from './getStacks'
	import { createPeriod } from './createPeriod'
	import PeriodCard from './PeriodCard.svelte'
	export let team: Team & { periods: PeriodWithMembers[] }
	export let plan: Plan

	$: stacks = getStacks(team.periods)
</script>

<div
	class="flex flex-col w-full relative py-2 gap-2"
	use:createPeriod={{
		plan,
		team,
		isEnable: (target) => target.classList.contains('stack-row'),
	}}
>
	{#each stacks as periods}
		<div class="flex items-stretch stack-row min-h-[30px]">
			{#each periods as period (period.id)}
				<PeriodCard
					{period}
					{plan}
					drags={[
						{ class: 'top-1/2', axis: 'x', moveStart: true },
						{ class: 'left-full top-1/2', axis: 'x', moveEnd: true },
						{ class: 'left-1/2 top-full', moveStart: true, moveEnd: true },
					]}
					on:update={({ detail: newPeriod }) => {
						team.periods = team.periods.map((p) => (p.id === newPeriod.id ? newPeriod : p))
					}}
				/>
			{/each}
		</div>
	{/each}
</div>

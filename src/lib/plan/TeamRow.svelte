<script lang="ts">
	import type { Team } from '@prisma/client'
	import type { PeriodWithMembers, Plan } from './types'
	import { getStacks } from './getStacks'
	import { createPeriod } from './createPeriod'
	import PeriodCard from './PeriodCard.svelte'
	interface Props {
		team: Team & { periods: PeriodWithMembers[] }
		plan: Plan
	}

	let { team = $bindable(), plan }: Props = $props()

	let stacks = $derived(getStacks(team.periods))
</script>

<div
	class="flex flex-col w-full relative py-1 gap-2"
	use:createPeriod={{
		plan,
		team,
		isEnable: (target) => target.classList.contains('stack-row'),
	}}
>
	{#each stacks as periods, i (i)}
		<div class="flex items-stretch stack-row min-h-7.5">
			{#each periods as period (period.id)}
				<PeriodCard
					{period}
					{plan}
					drags={[
						{ class: 'top-1/2', axis: 'x', moveStart: true },
						{ class: 'left-full top-1/2', axis: 'x', moveEnd: true },
						{ class: 'left-1/2 top-full', moveStart: true, moveEnd: true },
					]}
					onupdate={(newPeriod) => {
						team.periods = team.periods.map((p) => (p.id === newPeriod.id ? newPeriod : p))
					}}
				/>
			{/each}
		</div>
	{/each}
</div>

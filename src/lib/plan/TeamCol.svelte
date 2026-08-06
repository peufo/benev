<script lang="ts">
	import type { Team } from '@prisma/client'
	import { ArrowDownToLineIcon, ArrowUpToLineIcon, MoveVerticalIcon } from '@lucide/svelte'
	import type { PeriodWithMembers, Plan } from './types'
	import { getStacks } from './getStacks'
	import { createPeriod } from './createPeriod.svelte'
	import PeriodCard from './PeriodCard.svelte'
	interface Props {
		team: Team & { periods: PeriodWithMembers[] }
		plan: Plan
		onupdate?: (value: Team & { periods: PeriodWithMembers[] }) => void
	}

	let { team, plan, onupdate }: Props = $props()

	let stacks = $derived(getStacks(team.periods))
</script>

<div
	class="flex h-full relative px-2 gap-2"
	use:createPeriod={{
		plan,
		team,
		isEnable: (target) => target.classList.contains('stack-col'),
	}}
>
	{#each stacks as periods, i (i)}
		<div class="relative w-full min-w-24 stack-col">
			{#each periods as period (period.id)}
				<PeriodCard
					{period}
					{plan}
					drags={[
						{ class: 'left-full', moveStart: true, icon: ArrowUpToLineIcon },
						{ class: 'left-full top-full', moveEnd: true, icon: ArrowDownToLineIcon },
						{ class: 'left-full top-1/2', moveStart: true, moveEnd: true, icon: MoveVerticalIcon },
					]}
					onupdate={(newPeriod) => {
						onupdate?.({
							...team,
							periods: team.periods.map((p) => (p.id === newPeriod.id ? newPeriod : p)),
						})
					}}
				/>
			{/each}
		</div>
	{/each}
</div>

<script lang="ts">
	import type { Team } from '@prisma/client'
	import { ArrowLeftToLineIcon, ArrowRightToLineIcon, MoveHorizontalIcon } from '@lucide/svelte'
	import type { PeriodWithMembers, Plan } from './types'
	import { getStacks } from './getStacks'
	import { createPeriod } from './createPeriod'
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
						{ class: 'top-full', moveStart: true, icon: ArrowLeftToLineIcon },
						{
							class: 'left-1/2 top-full',
							moveStart: true,
							moveEnd: true,
							icon: MoveHorizontalIcon,
						},
						{ class: 'left-full top-full', moveEnd: true, icon: ArrowRightToLineIcon },
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

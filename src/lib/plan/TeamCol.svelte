<script lang="ts">
	import type { Team } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import type { PeriodWithSubscribesUserName } from './types'
	import { getStacks } from './getStacks'
	import PeriodCard from './PeriodCardV.svelte'

	export let team: Team & { periods: PeriodWithSubscribesUserName[] }
	export let range: { start: Dayjs; end: Dayjs }
	export let msSize: number

	$: stacks = getStacks(team.periods)
	$: origin = range.start.startOf('hour')
</script>

<div class="px-4">
	{#each stacks as periods}
		<div class="flex flex-col">
			{#each periods as period (period.id)}
				<PeriodCard {origin} {period} {msSize} />
			{/each}
		</div>
	{/each}
</div>

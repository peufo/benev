<script lang="ts">
	import type { Team } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import PeriodCardH from '$lib/plan/PeriodCardH.svelte'
	import type { PeriodWithSubscribesUserName } from './types'
	import { getStacks } from './getStacks'

	export let team: Team & { periods: PeriodWithSubscribesUserName[] }
	export let msSize: number
	export let origin: Dayjs

	$: stacks = getStacks(team.periods)
</script>

<div class="pb-4">
	{#each stacks as periods}
		<div class="flex items-stretch">
			{#each periods as period (period.id)}
				<PeriodCardH {origin} {period} {msSize} />
			{/each}
		</div>
	{/each}
</div>

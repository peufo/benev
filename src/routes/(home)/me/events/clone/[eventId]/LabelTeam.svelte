<script lang="ts">
	import { formatRange } from '$lib/formatRange'
	import { getRangeOfTeam } from '$lib/plan'
	import type { Period, Team } from '@prisma/client'

	export let team: Team & { periods: Period[] }
	export let deltaDays: number
	const range = getRangeOfTeam(team)
	const DAY = 1000 * 60 * 60 * 24
</script>

<div class="flex flex-col gap-1">
	<span>{team.name}</span>
	{#if range}
		<span class="text-xs text-error line-through">{formatRange(range)}</span>
		<span class="text-xs">
			{formatRange({
				start: range.start.getTime() + deltaDays * DAY,
				end: range.end.getTime() + deltaDays * DAY,
			})}
		</span>
	{/if}
</div>

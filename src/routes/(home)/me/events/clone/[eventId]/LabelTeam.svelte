<script lang="ts">
	import { formatRangeDate } from '$lib/formatRange'
	import { getRangeOfTeam } from '$lib/plan'
	import type { Period, Team } from '@prisma/client'

	export let team: Team & { periods: Period[] }

	const rang = getRangeOfTeam(team)
</script>

<fieldset style="border: 1px solid #bbb" class="p-2 rounded">
	<legend class="px-2">Secteurs</legend>

	{#each teams as team}
		<div class="border rounded">
			<span>{team.name}</span>
		</div>
	{/each}
</fieldset>

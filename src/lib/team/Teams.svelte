<script lang="ts">
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { Placeholder } from 'fuma'
	import TeamCard from './TeamCard.svelte'

	import { createEventDispatcher } from 'svelte'

	export let teams: TeamWithComputedValues[]

	const dispatch = createEventDispatcher<{
		clickPeriod: PeriodWithComputedValues & { team: TeamWithComputedValues }
	}>()
</script>

{#if teams.length}
	<div class="flex flex-col gap-4">
		{#each teams as team (team.id)}
			<TeamCard
				{team}
				on:clickPeriod={({ detail }) => dispatch('clickPeriod', { ...detail, team })}
			/>
		{/each}
	</div>
{:else}
	<Placeholder>
		<span>Pas de secteurs</span>
	</Placeholder>
{/if}

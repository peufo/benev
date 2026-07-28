<script lang="ts">
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { Placeholder } from '$lib/fuma'
	import TeamCard from './TeamCard.svelte'

	import { createEventDispatcher } from 'svelte'

	interface Props {
		teams: TeamWithComputedValues[]
		placeholder?: import('svelte').Snippet
	}

	let { teams, placeholder }: Props = $props()

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
		{#if placeholder}{@render placeholder()}{:else}Pas de secteur publique{/if}
	</Placeholder>
{/if}

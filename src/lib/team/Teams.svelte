<script lang="ts">
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { Placeholder } from '$lib/fuma-legacy'
	import TeamCard from './TeamCard.svelte'

	interface Props {
		teams: TeamWithComputedValues[]
		placeholder?: import('svelte').Snippet
		/** Remplacent les évènements de la version Svelte 4. */
		onclickPeriod?: (value: PeriodWithComputedValues & { team: TeamWithComputedValues }) => void
	}

	let { teams, placeholder, onclickPeriod }: Props = $props()
</script>

{#if teams.length}
	<div class="flex flex-col gap-4">
		{#each teams as team (team.id)}
			<TeamCard {team} onclickPeriod={(detail) => onclickPeriod?.({ ...detail, team })} />
		{/each}
	</div>
{:else}
	<Placeholder>
		{#if placeholder}{@render placeholder()}{:else}Pas de secteur publique{/if}
	</Placeholder>
{/if}

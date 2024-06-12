<script lang="ts">
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { toast } from 'svelte-sonner'
	import { Placeholder, USE_COERCE_JSON, listEditable } from 'fuma'
	import TeamCard from './TeamCard.svelte'
	import { isDragged } from './isDragged'
	import { createEventDispatcher } from 'svelte'
	import axios from 'axios'
	import { eventPath } from '$lib/store'

	export let teams: TeamWithComputedValues[]

	const dispatch = createEventDispatcher<{
		clickPeriod: PeriodWithComputedValues & { team: TeamWithComputedValues }
	}>()

	async function handleReorder(reorderedTeams: TeamWithComputedValues[]) {
		teams = reorderedTeams
		const form = new FormData()
		form.append('teams', JSON.stringify(teams.map((t, i) => ({ id: t.id, position: i }))))

		axios
			.postForm(`${$eventPath}/teams?/teams_reorder`, form)
			.then(() => toast.success('Nouvel ordre sauvegardé'))
			.catch((err) => toast.error(err))
	}
</script>

{#if teams.length}
	<div
		class="flex flex-col gap-4"
		use:listEditable={{
			dragElementsSelector: '.drag-button',
			items: teams,
			onChange: handleReorder,
			onDragStart() {
				isDragged.set(true)
			},
			onDragEnd() {
				isDragged.set(false)
			},
		}}
	>
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

<style>
	:global(.item-placeholder) {
		border-radius: 1rem !important;
	}
</style>

<script lang="ts">
	import type { PeriodWithComputedValues, TeamWithComputedValues } from '$lib/server'
	import { Placeholder, listEditable } from 'fuma'
	import TeamCard from './TeamCard.svelte'
	import { isDragged } from './isDragged'
	import { derived } from 'svelte/store'
	import { page } from '$app/stores'
	import { createEventDispatcher } from 'svelte'

	export let teams: TeamWithComputedValues[]

	/** By pass $onlyAvailable store flag */
	export let showAll = false

	const dispatch = createEventDispatcher<{
		clickPeriod: PeriodWithComputedValues & { team: TeamWithComputedValues }
	}>()

	const onlyAvailable = derived(page, ({ url }) => url.searchParams.get('onlyAvailable') === 'open')

	$: _teams = teams.filter((team) => {
		if (!$onlyAvailable || showAll) return true
		return team.isAvailable
	})
</script>

{#if _teams.length}
	<div
		class="flex flex-col gap-4"
		use:listEditable={{
			dragElementsSelector: '.drag-button',
			items: _teams,
			onChange(newTeamsOrder) {
				_teams = newTeamsOrder
				// SAVE NEW ORDER ON DB
			},
			onDragStart() {
				isDragged.set(true)
			},
			onDragEnd() {
				isDragged.set(false)
			},
		}}
	>
		{#each _teams as team (team.id)}
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

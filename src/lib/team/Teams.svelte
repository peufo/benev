<script lang="ts">
	import type { TeamWithComputedValues } from '$lib/server'
	import type { Member } from '@prisma/client'
	import { Placeholder, listEditable } from 'fuma'
	import { onlyAvailable } from '$lib/store'
	import TeamCard from './TeamCard.svelte'
	import { isDragged } from './isDragged'

	export let teams: (TeamWithComputedValues & {
		leaders: (Member & {
			user: { firstName: string; lastName: string; email: string; phone: string | null }
		})[]
	})[]

	/** By pass $onlyAvailable store flag */
	export let showAll = false

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
			onDragStart() {
				isDragged.set(true)
			},
			onDragEnd() {
				isDragged.set(false)
			},
		}}
	>
		{#each _teams as team (team.id)}
			<TeamCard {team} />
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

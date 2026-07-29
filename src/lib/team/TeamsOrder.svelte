<script lang="ts">
	import type { Team } from '@prisma/client'
	import { toast } from 'svelte-sonner'
	import { Placeholder } from '$lib/fuma-legacy'
	import { listEditable } from 'fuma'
	import { invalidateAll } from '$app/navigation'
	import { reorderTeams } from './team.remote'

	type _Team = Pick<Team, 'id' | 'name'>

	interface Props {
		teams: _Team[]
	}

	let { teams = $bindable() }: Props = $props()

	async function handleReorder(reorderedTeams: _Team[]) {
		teams = reorderedTeams
		try {
			await reorderTeams(teams.map(({ id }) => id))
			toast.success('Nouvel ordre sauvegardé')
			await invalidateAll()
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Réordonnancement impossible')
		}
	}
</script>

{#if teams.length}
	<div
		class="flex flex-col gap-2"
		use:listEditable={{
			items: teams,
			onChange: handleReorder,
		}}
	>
		{#each teams as team (team.id)}
			<div class="menu-item bg-base-100 border">
				{team.name}
			</div>
		{/each}
	</div>
{:else}
	<Placeholder>
		<span>Pas de secteurs</span>
	</Placeholder>
{/if}

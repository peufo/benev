<script lang="ts">
	import type { Team } from '@prisma/client'
	import { toast } from 'svelte-sonner'
	import { Placeholder, listEditable } from 'fuma'
	import axios from 'axios'
	import { eventPath } from '$lib/store'
	import { invalidateAll } from '$app/navigation'

	type _Team = Pick<Team, 'id' | 'name'>

	export let teams: _Team[]

	async function handleReorder(reorderedTeams: _Team[]) {
		teams = reorderedTeams
		const form = new FormData()
		form.append('teams', JSON.stringify(teams.map((t, i) => ({ id: t.id, position: i }))))
		axios
			.postForm(`${$eventPath}/teams?/teams_reorder`, form)
			.then(async () => {
				toast.success('Nouvel ordre sauvegardé')
				await invalidateAll()
			})
			.catch((err) => toast.error(err))
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

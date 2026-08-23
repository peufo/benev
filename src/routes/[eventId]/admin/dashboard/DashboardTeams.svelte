<script lang="ts">
	import Progress from '$lib/Progress.svelte'
	import { eventPath } from '$lib/eventPath'
	import { Placeholder } from '$lib/ui'
	import type { PageData } from './$types'

	let { teams }: { teams: PageData['teams'] } = $props()
</script>

{#if !teams.length}
	<Placeholder>Aucun secteur</Placeholder>
{:else}
	<ul class="flex flex-col">
		{#each teams as team (team.id)}
			<li class="flex items-center gap-3 py-1 border-b border-soft last:border-0">
				<a
					href={eventPath('/admin/teams/[teamId]', { teamId: team.id })}
					class="link link-hover text-sm truncate min-w-0"
				>
					{team.name}
				</a>
				<Progress period={team} wrap={false} class="ml-auto grow max-w-[50%]" />
			</li>
		{/each}
	</ul>
{/if}

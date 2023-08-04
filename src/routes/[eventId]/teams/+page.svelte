<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'

	export let data

</script>

<div class="p-4 card bg-base-100 max-w-4xl m-auto">
	<div class="flex gap-2 py-2 items-center">
		<h2 class="text-2xl">Équipes</h2>
		<div class="grow" />
		{#if data.isOwner}
			<a href="/{$page.params.eventId}/teams/create" class="btn btn-neutral">
				<Icon path={mdiPlus} />
				Ajouter une équipe
			</a>
		{/if}
	</div>
	<hr />

	<table class="table">
		<thead>
			<tr>
				<th>Nom</th>
				<th>Responsable</th>
			</tr>
		</thead>

		<tbody>
			{#each data.teams as team}
				<tr class="hover cursor-pointer relative">
					<td>{team.name}</td>
					<td
						>{team.leaders.map((leader) => `${leader.firstName} ${leader.lastName}`).join(', ')}</td
					>
					<a href="/{$page.params.eventId}/teams/{team.id}" class="inset-0 absolute">{' '}</a>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

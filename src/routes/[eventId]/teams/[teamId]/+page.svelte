<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'

	export let data

	$: isOwner = data.event.ownerId === data.user?.userId

</script>

<div class="p-4 card bg-base-100 max-w-4xl m-auto">
	<div class="flex gap-2 py-2 items-center">
    <div>
      <h2 class="text-2xl">{data.team.name}</h2>
      <p>{data.team.description || ''}</p>
    </div>
		<div class="grow" />
		{#if isOwner}
			<a href="/{$page.params.eventId}/teams/create" class="btn btn-neutral">
				<Icon path={mdiPlus} />
				Générer des périodes
			</a>
		{/if}
	</div>
	<hr />

	<table class="table">
		<thead>
			<tr>
				<th>Période de travail</th>
				<th>Bénévoles</th>
			</tr>
		</thead>

		<tbody>
			{#each data.periods as period}
				<tr class="hover cursor-pointer relative">
					<td>{period.start}</td>
					<td>prout</td>
					
				</tr>
			{/each}
		</tbody>
	</table>
</div>

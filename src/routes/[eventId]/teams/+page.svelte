<script lang="ts">
	import { mdiPencilOutline, mdiPlus } from '@mdi/js'
	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'

	export let data

</script>

<div class="p-4 card bg-base-100 max-w-4xl m-auto">
	<div class="flex gap-2 py-2 items-center">
		<h2 class="text-2xl">Secteurs</h2>
		<div class="grow" />
		{#if data.isOwner}
			<a href="{$eventPath}/teams/create" class="btn btn-neutral">
				<Icon path={mdiPlus} class="fill-neutral-content" />
				Ajouter une équipe
			</a>
		{/if}
	</div>
	<div class="divider" />

	<table class="table text-base">
		<thead>
			<tr>
				<th>Nom</th>
				<th>Responsable</th>
			</tr>
		</thead>

		<tbody>
			{#each data.teams as team}
				<tr class="hover cursor-pointer relative">
					<td>
						{team.name}
						<a href="{$eventPath}/teams/{team.id}">
							<span class="inset-0 absolute"></span>
						</a>
					
					</td>
					<td>
						{team.leaders.map((leader) => `${leader.firstName} ${leader.lastName}`).join(', ')}
					</td>

					<td class="py-0">
						<div class="flex justify-end">
							<a class="btn btn-square btn-sm relative" href="{$eventPath}/teams/{team.id}/edit">
								<Icon path={mdiPencilOutline} />
							</a>
						</div>
					</td>

				</tr>
			{/each}
		</tbody>
	</table>
</div>

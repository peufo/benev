<script lang="ts">
	import { Card, Icon } from '$lib/material'
	import { mdiPlus } from '@mdi/js'

	export let data
</script>

<Card>
	<div class="flex gap-2">
		<h2 class="title">Licences</h2>

		<a href="/root/licences/create" class="btn btn-square btn-sm ml-auto">
			<Icon path={mdiPlus} title="Créer des licences manuellement" />
		</a>
	</div>

	<table class="table">
		<thead>
			<tr>
				<td>Owner</td>
				<td>CreatedAt</td>
				<td>Type</td>
				<td>Quantity</td>
			</tr>
		</thead>
		<tbody>
			{#each data.licences as licence}
				<tr>
					<td>
						<a href="/root/users/{licence.owner.id}" class="link link-hover">
							{licence.owner.firstName}
							{licence.owner.lastName}
						</a>
					</td>
					<td>
						{licence.createdAt.toLocaleDateString()}
					</td>
					<td>{licence.type}</td>
					<td>{licence.quantity}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>

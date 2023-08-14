<script lang="ts">
	import Contact from '$lib/Contact.svelte'
	import { eventPath } from '$lib/store'

	export let data
</script>

<table class="table">
	<thead>
		<tr>
			<th>Responsable</th>
			<th>Équipes à charges</th>
		</tr>
	</thead>

	<tbody>
		{#each data.users as user}
			<tr class="relative hover">
				<td>
					<a href="{$eventPath}/admin/leaders/{user.id}" class="absolute inset-0">{' '}</a>
					{user.firstName}
					{user.lastName}
				</td>
				<td>
					<div class="badge badge-lg">
						{user.leadersOf.length}
					</div>
				</td>
				<td align="right">
					<Contact {user} />
				</td>
			</tr>
		{/each}
	</tbody>
</table>

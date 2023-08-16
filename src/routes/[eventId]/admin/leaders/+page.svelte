<script lang="ts">
	import Contact from '$lib/Contact.svelte'
	import { eventPath } from '$lib/store'

	export let data
</script>

<table class="table">
	<thead>
		<tr>
			<th>Responsable</th>
			<th>Secteurs à charge</th>
		</tr>
	</thead>

	<tbody>
		{#each data.members as member}
			<tr class="relative hover">
				<td>
					<a href="{$eventPath}/admin/leaders/{member.id}" class="absolute inset-0">{' '}</a>
					{member.user.firstName}
					{member.user.lastName}
				</td>
				<td>
					{#each member.leaderOf.map((team) => team.name) as team}
						<div class="badge badge-lg mr-1">
							{team}
						</div>
					{/each}
				</td>
				<td align="right">
					<Contact user={member.user} />
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<script lang="ts">
	import { Card } from '$lib/material'

	export let data
</script>

<Card>
	<table class="table">
		<thead>
			<tr>
				<td>Name</td>
				<td>State</td>
				<td>Owner</td>
				<td>Members</td>
			</tr>
		</thead>
		<tbody>
			{#each data.events as event}
				<tr>
					<td>
						<a href="/{event.id}" class="link link-hover">
							{event.name}
						</a>
					</td>
					<td>{event.state}</td>
					<td>{event.owner.firstName} {event.owner.lastName}</td>
					<td>{event._count.members}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>

<script lang="ts">
	import { Card } from 'fuma'

	export let data
</script>

<Card>
	<table class="table">
		<thead>
			<tr>
				<th>Id</th>
				<th>Name</th>
				<th>CreatedAt</th>
				<th>DeletedAt</th>
				<th>State</th>
				<th>Owner</th>
				<th>Members</th>
			</tr>
		</thead>
		<tbody>
			{#each data.events as event}
				<tr>
					<td>{event.id}</td>
					<td>
						<a href="/{event.id}" class="link link-hover">
							{event.name}
						</a>
					</td>
					<td>
						{event.createdAt.toLocaleDateString()}
					</td>
					<td>
						{event.deletedAt?.toLocaleDateString() || '-'}
					</td>
					<td>{event.state}</td>
					<td>{event.owner.firstName} {event.owner.lastName}</td>
					<td>{event._count.members}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>

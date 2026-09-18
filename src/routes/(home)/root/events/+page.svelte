<script lang="ts">
	import { resolve } from '$app/paths'
	import { InputSearch, Surface } from '$lib/ui'
	import { Pagination } from 'fuma'

	let { data } = $props()
</script>

<Surface title="Evenements ({data.eventsCount})" class="min-w-0 overflow-auto">
	{#snippet action()}
		<InputSearch />
	{/snippet}
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
				<th></th>
			</tr>
		</thead>
		<tbody class="">
			{#each data.events as event (event.id)}
				<tr>
					<td>{event.id}</td>
					<td>
						<a
							href={resolve('/(home)/root/events/[eventId]', { eventId: event.id })}
							class="link link-hover"
						>
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
	<div class="ml-auto">
		<Pagination />
	</div>
</Surface>

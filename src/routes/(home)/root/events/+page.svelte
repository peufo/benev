<script lang="ts">
	import { Card, InputSearch, Pagination } from '$lib/fuma'

	let { data } = $props();
</script>

<Card class="min-w-0" bodyClass="overflow-auto">
	{#snippet title()}
		<h2  class="title">Evenements ({data.eventsCount})</h2>
	{/snippet}
	{#snippet action()}
		<div >
			<InputSearch />
		</div>
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
						<a href="/root/events/{event.id}" class="link link-hover">
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
</Card>

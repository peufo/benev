<script lang="ts">
	import { Card, InputSearch, Pagination } from 'fuma'
	import { ChartPie } from 'lucide-svelte'

	export let data
</script>

<Card class="min-w-0" bodyClass="overflow-auto">
	<h2 slot="title" class="title">Evenements ({data.eventsCount})</h2>
	<div slot="action">
		<InputSearch />
	</div>
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
				<th />
			</tr>
		</thead>
		<tbody class="">
			{#each data.events as event}
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

<script lang="ts">
	import { Card, Pagination } from 'fuma'

	export let data
</script>

<Card>
	<h2 class="title">Users ({data.usersCount})</h2>

	<table class="table">
		<thead>
			<tr>
				<td>Name</td>
				<td>Email</td>
				<td>CreatedAt</td>
				<td>Events</td>
				<td>Members</td>
				<td>Licences (event)</td>
				<td>Licences (member)</td>
			</tr>
		</thead>
		<tbody>
			{#each data.users as user}
				{@const licencesEvent = user.licences.filter((l) => l.type === 'event')}
				{@const licencesMember = user.licences.filter((l) => l.type === 'member')}

				<tr>
					<td>
						<a href="/root/users/{user.id}" class="link link-hover">
							{user.firstName}
							{user.lastName}
						</a>
					</td>
					<td>
						<a href="mailto:{user.email}" class="link link-hover">
							{user.email}
						</a>
					</td>
					<td>
						{user.createdAt.toLocaleDateString()}
					</td>
					<td>{user._count.events}</td>
					<td>{user._count.members}</td>
					<td>
						{licencesEvent.filter((l) => l.eventId).length} / {licencesEvent.length}
					</td>
					<td>
						{licencesMember.filter((l) => l.memberId).length} / {licencesMember.length}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="flex justify-end mt-2">
		<Pagination />
	</div>
</Card>

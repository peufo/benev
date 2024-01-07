<script lang="ts">
	import { Card } from '$lib/material'

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
			</tr>
		</thead>
		<tbody>
			{#each data.users as user}
				<tr>
					<td>
						<a href="/root/users/{user.id}" class="link link-hover">
							{user.firstName}
							{user.lastName}
						</a>
					</td>
					<td>
						<a href="mailto:{user.email}">
							{user.email}
						</a>
					</td>
					<td>
						{user.createdAt.toLocaleDateString()}
					</td>
					<td>{user._count.events}</td>
					<td>{user._count.members}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>

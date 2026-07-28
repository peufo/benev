<script lang="ts">
	import { mdiCheck, mdiClose } from '@mdi/js'
	import { Card, DropDown, Icon, InputSearch, Pagination } from '$lib/fuma'
	import TDSortable from './TDSortable.svelte'

	let { data } = $props()
</script>

<Card>
	{#snippet title()}
		<h2 class="title">Users ({data.usersCount})</h2>
	{/snippet}
	{#snippet action()}
		<div>
			<InputSearch />
		</div>
	{/snippet}
	<table class="table">
		<thead>
			<tr>
				<td>Name</td>
				<td>Email</td>
				<td>CreatedAt</td>
				<TDSortable key="events">Events</TDSortable>
				<TDSortable key="members">Members</TDSortable>
				<td>Clé</td>
			</tr>
		</thead>
		<tbody>
			{#each data.users as user (user.id)}
				{@const isCorrectKey =
					(user.auth_key.length === 1 && user.auth_key[0].id.startsWith('google:')) ||
					user.auth_key.find((k) => k.id.endsWith(user.email))}

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
					<DropDown tippyProps={{ trigger: 'mouseenter' }}>
						{#snippet activator()}
							<td>
								{user._count.members}
							</td>
						{/snippet}
						<ul>
							{#each user.members as member (member.id)}
								<li>
									<a class="link link-hover" href="/{member.eventId}">{member.event.name}</a>
								</li>
							{/each}
						</ul>
					</DropDown>
					<td>
						<Icon
							path={isCorrectKey ? mdiCheck : mdiClose}
							class={isCorrectKey ? 'fill-success' : 'fill-error'}
							title="{user.email} -> {user.auth_key.map((k) => k.id).join(', ')}"
						/>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="flex justify-end mt-2">
		<Pagination />
	</div>
</Card>

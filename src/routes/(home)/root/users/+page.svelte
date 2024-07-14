<script lang="ts">
	import { mdiCheck, mdiClose } from '@mdi/js'
	import { Card, DropDown, Icon, InputSearch, Pagination } from 'fuma'

	export let data
</script>

<Card>
	<h2 slot="title" class="title">Users ({data.usersCount})</h2>
	<div slot="action">
		<InputSearch />
	</div>
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
				<td>Clé</td>
			</tr>
		</thead>
		<tbody>
			{#each data.users as user}
				{@const licencesEvent = user.licences.filter((l) => l.type === 'event')}
				{@const licencesMember = user.licences.filter((l) => l.type === 'member')}
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
						<td slot="activator">
							{user._count.members}
						</td>
						<ul>
							{#each user.members as member}
								<li>
									<a class="link link-hover" href="/{member.eventId}">{member.event.name}</a>
								</li>
							{/each}
						</ul>
					</DropDown>
					<td>
						{licencesEvent.filter((l) => l.eventId).length} / {licencesEvent.length}
					</td>
					<td>
						{licencesMember.filter((l) => l.memberId).length} / {licencesMember.length}
					</td>
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

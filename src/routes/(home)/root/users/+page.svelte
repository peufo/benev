<script lang="ts">
	import { resolve } from '$app/paths'
	import { CheckIcon, XIcon } from '@lucide/svelte'
	import { Card, InputSearch } from '$lib/ui'
	import { DropDown, tip } from 'fuma'
	import { Pagination } from 'fuma'
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
				{@const KeyIcon = isCorrectKey ? CheckIcon : XIcon}

				<tr>
					<td>
						<a
							href={resolve('/(home)/root/users/[userId]', { userId: user.id })}
							class="link link-hover"
						>
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
									<a
										class="link link-hover"
										href={resolve('/[eventId]', { eventId: member.eventId })}>{member.event.name}</a
									>
								</li>
							{/each}
						</ul>
					</DropDown>
					<td>
						<span
							class="inline-flex"
							use:tip={{ content: `${user.email} -> ${user.auth_key.map((k) => k.id).join(', ')}` }}
						>
							<KeyIcon class={isCorrectKey ? 'text-success' : 'text-error'} />
						</span>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="flex justify-end mt-2">
		<Pagination />
	</div>
</Card>

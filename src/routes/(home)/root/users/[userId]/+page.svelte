<script lang="ts">
	import { resolve } from '$app/paths'
	import { Card } from '$lib/ui'
	import { MemberRole } from '$lib/member'
	import { EVENT_TIER } from '$lib/constant'
	import { formatRangeDate } from '$lib/formatRange'
	import { CalendarDaysIcon, MailIcon, PhoneIcon, MapPinnedIcon } from '@lucide/svelte'

	let { data } = $props()

	let user = $derived(data.user)
	let fullAddress = $derived([user.street, user.zipCode, user.city].filter(Boolean).join(', '))
</script>

<div class="flex flex-col gap-4 p-4">
	<Card>
		{#snippet title()}
			<h2 class="title">{user.firstName} {user.lastName}</h2>
		{/snippet}

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div class="flex items-center gap-2">
				<MailIcon size={16} class="opacity-70" />
				<a href="mailto:{user.email}" class="link link-hover">
					{user.email}
				</a>
				{#if user.isEmailVerified}
					<span class="badge badge-sm badge-success">Vérifié</span>
				{:else}
					<span class="badge badge-sm badge-ghost">Non vérifié</span>
				{/if}
			</div>

			{#if user.phone}
				<div class="flex items-center gap-2">
					<PhoneIcon size={16} class="opacity-70" />
					<a href="tel:{user.phone}" class="link link-hover">
						{user.phone}
					</a>
				</div>
			{/if}

			{#if fullAddress}
				<div class="flex items-center gap-2">
					<MapPinnedIcon size={16} class="opacity-70" />
					<span>{fullAddress}</span>
				</div>
			{/if}

			{#if user.birthday}
				<div class="flex items-center gap-2">
					<CalendarDaysIcon size={16} class="opacity-70" />
					<span>{user.birthday.toLocaleDateString()}</span>
				</div>
			{/if}

			<div class="flex items-center gap-2 md:col-span-2 text-sm text-base-content/70">
				Compte créé le {user.createdAt.toLocaleDateString()}
			</div>
		</div>
	</Card>

	<Card>
		{#snippet title()}
			<h2 class="title">Événements ({data.members.length})</h2>
		{/snippet}

		{#if data.members.length}
			<table class="table">
				<thead>
					<tr>
						<th>Événement</th>
						<th>Plan</th>
						<th>Membres</th>
						<th>Créé le</th>
						<th>Dates</th>
						<th>Rôle</th>
					</tr>
				</thead>
				<tbody>
					{#each data.members as member (member.id)}
						<tr>
							<td>
								<a
									href={resolve('/(home)/root/events/[eventId]', { eventId: member.eventId })}
									class="link link-hover font-medium"
								>
									{member.event.name}
								</a>
							</td>
							<td>
								<span class="badge badge-sm badge-ghost">
									{EVENT_TIER[member.event.tier].label}
								</span>
							</td>
							<td>
								{member.event._count.members}
							</td>
							<td>
								{member.event.createdAt.toLocaleDateString()}
							</td>
							<td>
								{#if member.event.startDate && member.event.endDate}
									{formatRangeDate(
										{ start: member.event.startDate, end: member.event.endDate },
										member.event.timezone
									)}
								{:else}
									<span class="text-base-content/50">-</span>
								{/if}
							</td>
							<td>
								<MemberRole roles={member.roles} class="badge-sm badge-ghost" iconSize={14} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{:else}
			<p class="text-base-content/70">Ce compte n'est membre d'aucun évènement.</p>
		{/if}
	</Card>
</div>

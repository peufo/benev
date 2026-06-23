<script lang="ts">
	import { Card } from 'fuma'
	import { MemberRole } from '$lib/member'
	import { formatRangeDate } from '$lib/formatRange'
	import { CalendarDaysIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-svelte'

	export let data

	$: user = data.user
	$: fullAddress = [user.street, user.zipCode, user.city].filter(Boolean).join(', ')
</script>

<div class="flex flex-col gap-4 p-4">
	<Card>
		<h2 slot="title" class="title">{user.firstName} {user.lastName}</h2>

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
					<MapPinIcon size={16} class="opacity-70" />
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
		<h2 slot="title" class="title">Événements ({data.members.length})</h2>

		{#if data.members.length}
			<table class="table">
				<thead>
					<tr>
						<th>Événement</th>
						<th>Dates</th>
						<th>Rôle</th>
					</tr>
				</thead>
				<tbody>
					{#each data.members as member}
						<tr>
							<td>
								<a href="/{member.eventId}" class="link link-hover font-medium">
									{member.event.name}
								</a>
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
			<p class="text-base-content/70">Cet utilisateur n'est membre d'aucun événement.</p>
		{/if}
	</Card>
</div>

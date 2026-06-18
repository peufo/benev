<script lang="ts">
	import type { PageData } from './$types'
	import { MemberRole } from '$lib/member'
	import { EVENT_STATES } from '$lib/constant'
	import { CardLink, tip } from 'fuma'
	import logo from '$lib/assets/logo.svg'
	import { CopyPlusIcon, CalendarDaysIcon } from 'lucide-svelte'
	import { EventIcon } from '$lib/event'
	import { formatRangeDate } from '$lib/formatRange'

	export let member: PageData['members'][number]

	$: nbSubscribes = member.subscribes.length
	$: nbLeaderOf = member.leaderOf.length
	$: isOwner = member.roles.includes('owner')

	const TIER_LABEL: Record<string, string> = {
		basic: 'Basique',
		standard: 'Standard',
		premium: 'Premium',
		pro: 'Pro',
	}
</script>

<CardLink href="/{member.eventId}/me">
	<div class="flex gap-4">
		<div class="shrink-0">
			{#if member.event.posterId}
				<img
					src="/media/{member.event.posterId}?size=a4"
					alt="Affiche de {member.event.name}"
					class="w-20 h-28 object-cover rounded border border-base-200"
				/>
			{:else}
				<div class="w-20 h-28 grid place-content-center rounded border border-base-200 bg-base-100">
					<img src={logo} alt="Affiche par défaut" class="w-10 grayscale opacity-40" />
				</div>
			{/if}
		</div>

		<div class="grow flex flex-col min-w-0">
			<div class="flex items-start justify-between gap-3">
				<div class="flex items-start gap-2 min-w-0">
					{#if member.event.icon}
						<EventIcon
							icon={member.event.icon}
							alt="logo de {member.event.name}"
							class="w-5 h-5 inline-block shrink-0 mt-0.5"
						/>
					{/if}

					<div class="min-w-0 flex flex-col gap-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="font-semibold truncate">{member.event.name}</span>
							{#if member.event.state !== 'published'}
								<span class="badge badge-sm badge-ghost">
									{EVENT_STATES[member.event.state].label}
								</span>
							{/if}
						</div>

						<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/70">
							{#if member.event.startDate && member.event.endDate}
								<span class="inline-flex items-center gap-1">
									<CalendarDaysIcon size={14} />
									{formatRangeDate(
										{ start: member.event.startDate, end: member.event.endDate },
										member.event.timezone
									)}
								</span>
							{/if}
							<MemberRole roles={member.roles} class="badge-sm badge-ghost" iconSize={14} />
							{#if isOwner}
								<span class="badge badge-sm badge-ghost opacity-80">
									{TIER_LABEL[member.event.tier] || member.event.tier}
								</span>
							{/if}
						</div>
					</div>
				</div>

				{#if member.roles.includes('admin')}
					<a
						class="btn btn-sm btn-square btn-ghost z-10 shrink-0 -mr-2 -mt-2"
						href="/me/events/clone/{member.eventId}"
						use:tip={{ content: "Cloner l'évènement" }}
					>
						<CopyPlusIcon size={18} opacity={0.6} />
					</a>
				{/if}
			</div>

			<div class="flex flex-wrap gap-2 mt-auto pt-2">
				<div class="badge badge-sm badge-ghost whitespace-nowrap">
					{#if nbSubscribes}
						<b class="mr-1 opacity-80">{nbSubscribes}</b>
						<span>Inscription{nbSubscribes > 1 ? 's' : ''}</span>
					{:else}
						<span>Pas d'inscription</span>
					{/if}
				</div>

				{#if nbLeaderOf}
					<div class="badge badge-sm badge-ghost whitespace-nowrap">
						<b class="mr-1 opacity-80">{nbLeaderOf}</b>
						<span>Secteur{nbLeaderOf > 1 ? 's' : ''} à charge</span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</CardLink>

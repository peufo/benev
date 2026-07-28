<script lang="ts">
	import { Card } from '$lib/fuma'
	import { msToHours } from '$lib/utils'
	import { formatRangeDate } from '$lib/formatRange'
	import {
		CalendarDaysIcon,
		UsersIcon,
		ArrowLeftIcon,
		ClockIcon,
		CheckCircleIcon,
		ExternalLinkIcon,
	} from '@lucide/svelte'

	let { data } = $props()

	let event = $derived(data.event)
	let stats = $derived(data.stats)
	let totalSubscribes = $derived(Object.values(stats.subscribesByState).reduce((a, b) => a + b, 0))
</script>

<div class="p-4 flex flex-col gap-4">
	<a href="/root/events" class="inline-flex items-center gap-1 link link-hover text-sm">
		<ArrowLeftIcon size={16} />
		Retour aux événements
	</a>

	<Card>
		{#snippet title()}
			<h2 class="title flex items-center">
				<span>{event.name}</span>
				<a href="/{event.id}" class="ml-auto" target="_blank">
					<ExternalLinkIcon />
				</a>
			</h2>
		{/snippet}

		<div class="flex flex-col gap-2 text-sm">
			<div class="flex flex-wrap gap-x-4 gap-y-1 text-base-content/80">
				<span>
					Propriétaire :
					<a href="/root/users/{event.ownerId}" class="link link-hover">
						{event.owner.firstName}
						{event.owner.lastName}
					</a>
				</span>
				<span class="badge badge-sm badge-ghost capitalize">{event.state}</span>
			</div>

			{#if event.startDate && event.endDate}
				<div class="inline-flex items-center gap-2 text-base-content/70">
					<CalendarDaysIcon size={16} />
					{formatRangeDate({ start: event.startDate, end: event.endDate }, event.timezone)}
				</div>
			{/if}
		</div>
	</Card>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		<Card>
			<div class="flex items-center gap-3">
				<ClockIcon size={24} class="text-primary opacity-80" />
				<div>
					<div class="text-2xl font-bold">{stats.shiftsCount}</div>
					<div class="text-sm text-base-content/70">Shifts organisés</div>
				</div>
			</div>
		</Card>

		<Card>
			<div class="flex items-center gap-3">
				<ClockIcon size={24} class="text-warning opacity-80" />
				<div>
					<div class="text-2xl font-bold">{msToHours(stats.plannedWorkMs)}</div>
					<div class="text-sm text-base-content/70">Heures prévues</div>
				</div>
			</div>
		</Card>

		<Card>
			<div class="flex items-center gap-3">
				<CheckCircleIcon size={24} class="text-success opacity-80" />
				<div>
					<div class="text-2xl font-bold">{msToHours(stats.confirmedWorkMs)}</div>
					<div class="text-sm text-base-content/70">Heures confirmées</div>
				</div>
			</div>
		</Card>

		<Card>
			<div class="flex items-center gap-3">
				<UsersIcon size={24} class="text-info opacity-80" />
				<div>
					<div class="text-2xl font-bold">{stats.membersCount}</div>
					<div class="text-sm text-base-content/70">Membres</div>
				</div>
			</div>
		</Card>
	</div>

	<Card>
		{#snippet title()}
			<h3 class="title">Inscriptions ({totalSubscribes})</h3>
		{/snippet}
		<div class="flex flex-wrap gap-4">
			<div class="flex items-center gap-2">
				<span class="badge badge-warning badge-sm">{stats.subscribesByState.request}</span>
				<span class="text-sm text-base-content/70">En attente</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="badge badge-success badge-sm">{stats.subscribesByState.accepted}</span>
				<span class="text-sm text-base-content/70">Acceptées</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="badge badge-error badge-sm">{stats.subscribesByState.denied}</span>
				<span class="text-sm text-base-content/70">Refusées</span>
			</div>
			<div class="flex items-center gap-2">
				<span class="badge badge-ghost badge-sm">{stats.subscribesByState.cancelled}</span>
				<span class="text-sm text-base-content/70">Annulées</span>
			</div>
		</div>
	</Card>
</div>

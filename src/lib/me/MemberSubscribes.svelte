<script lang="ts">
	import type { Event, Period, Subscribe, Team } from '@prisma/client'
	import { formatRange } from '$lib/formatRange'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'
	import { Card, CardLink, Placeholder } from '$lib/material'
	import { page } from '$app/stores'
	import SubscribeCreatedBy from '$lib/SubscribeCreatedBy.svelte'

	export let events: (Event & {
		teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]
	})[]

	export let isLeader = false
</script>

<div class="flex flex-col gap-10">
	{#each events as event}
		<Card class="border">
			<span slot="title">
				{#if $$slots.title}
					<slot name="title" />
				{:else}
					<a class="link link-hover" href="/{event.id}">
						{#if event.logo}
							<img src={event.logo} alt="logo de {event.name}" class="w-8 pr-2 inline-block" />
						{/if}
						<span>{event.name}</span>
					</a>
				{/if}
			</span>

			{#if event.teams.length}
				<div
					class="grid gap-2 mt-2"
					style:grid-template-columns="repeat(auto-fill, minmax(325px, 1fr))"
				>
					{#each event.teams as team}
						<CardLink href="/{event.id}/teams/{team.id}">
							<span slot="title">{team.name}</span>
							{#each team.periods as period}
								<div class="flex gap-1 items-center mt-2">
									<div
										class="
											grow flex gap-2 items-center px-2 py-2 rounded
											{isLeader ? 'relative z-10 hover:bg-base-200' : ''}
										"
									>
										{#if isLeader}
											<a href="/{event.id}/teams/{team.id}/{period.id}" class="absolute inset-0">
												{' '}
											</a>
										{/if}

										<SubscribeCreatedBy createdBy={period.subscribes[0].createdBy} size={22} />

										<span class="text-sm">{formatRange(period)}</span>
										<div class="grow" />
									</div>

									<SubscribeStateForm
										subscribe={period.subscribes[0]}
										eventId={event.id}
										{isLeader}
									/>
								</div>
							{/each}
						</CardLink>
					{/each}
				</div>
			{:else}
				<Placeholder>
					<span>Aucune inscription pour le moment</span>
				</Placeholder>
			{/if}
		</Card>
	{:else}
		<Card>
			<Placeholder>
				<span>Aucune inscription pour le moment</span>
				<br />
				{#if $page.params.eventId}
					<a href="/{$page.params.eventId}/teams" class="btn"> Voir les secteurs </a>
				{:else}
					<a href="/" class="btn"> Trouve un évènement </a>
				{/if}
			</Placeholder>
		</Card>
	{/each}
</div>

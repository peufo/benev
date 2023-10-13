<script lang="ts">
	import type { Event, Period, Subscribe, Team } from '@prisma/client'
	import { formatRange } from '$lib/formatRange'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'
	import { Card, Icon, Placeholder } from '$lib/material'
	import { rowLink } from '$lib/action'
	import { page } from '$app/stores'
	import { mdiAccountCircleOutline, mdiShieldAccount } from '@mdi/js'
	import SubscribeCreatedBy from '$lib/SubscribeCreatedBy.svelte'

	export let events: (Event & {
		teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]
	})[]

	export let title = ''
	export let isLeader = false
</script>

<div class="flex flex-col gap-10">
	{#if title}
		<h1 class="text-2xl">{title}</h1>
	{/if}

	{#each events as event}
		<Card>
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
				<div class="grid gap-2" style:grid-template-columns="repeat(auto-fill, minmax(350px, 1fr))">
					{#each event.teams as team}
						{@const teamHref = `/${event.id}/teams/${team.id}`}
						<section class="border rounded-xl p-4 shadow">
							<a href={teamHref} class="link link-hover font-medium">
								{team.name}
							</a>

							{#each team.periods as period}
								{@const periodHref = `/${event.id}/teams/${team.id}/${period.id}`}

								<div class="flex gap-1 items-center mt-2">
									<a
										href={isLeader ? periodHref : teamHref}
										class="grow flex gap-2 items-center px-2 py-2 rounded hover:bg-base-200"
									>
										<SubscribeCreatedBy createdBy={period.subscribes[0].createdBy} size={22} />

										<span class="text-sm">{formatRange(period)}</span>
										<div class="grow" />
									</a>

									<SubscribeStateForm
										subscribe={period.subscribes[0]}
										eventId={event.id}
										{isLeader}
									/>
								</div>
							{/each}
						</section>
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

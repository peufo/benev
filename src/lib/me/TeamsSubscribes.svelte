<script lang="ts">
	import type { Period, Subscribe, Team } from '@prisma/client'
	import { page } from '$app/stores'
	import { formatRange } from '$lib/formatRange'
	import { CardLink, Placeholder } from '$lib/material'
	import { SubscribeCreatedBy, SubscribeStateForm } from '$lib/subscribe'

	export let teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]

	export let isLeader = false
</script>

{#if teams.length}
	<div class="grid gap-4 mt-2" style:grid-template-columns="repeat(auto-fill, minmax(325px, 1fr))">
		{#each teams as team}
			<CardLink title={team.name} href="/{team.eventId}/teams/{team.id}">
				{#each team.periods as period}
					<div class="flex gap-1 items-center mt-2">
						<div
							class="
								grow flex gap-2 items-center px-2 py-2 rounded
								{isLeader ? 'relative z-10 hover:bg-base-200' : ''}
							"
						>
							{#if isLeader}
								<a href="/{team.eventId}/teams/{team.id}/{period.id}" class="absolute inset-0">
									{' '}
								</a>
							{/if}

							<SubscribeCreatedBy createdBy={period.subscribes[0].createdBy} size={22} />

							<span class="text-sm">{formatRange(period)}</span>
							<div class="grow" />
						</div>

						<SubscribeStateForm
							subscribe={period.subscribes[0]}
							eventId={team.eventId}
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
		<br />
		{#if $page.params.eventId}
			<a href="/{$page.params.eventId}/teams" class="btn"> Voir les secteurs </a>
		{:else}
			<a href="/" class="btn"> Trouve un évènement </a>
		{/if}
	</Placeholder>
{/if}

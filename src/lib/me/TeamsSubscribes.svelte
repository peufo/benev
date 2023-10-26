<script lang="ts">
	import type { Period, Subscribe, Team } from '@prisma/client'
	import { formatRange } from '$lib/formatRange'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'
	import { CardLink, Placeholder } from '$lib/material'

	import SubscribeCreatedBy from '$lib/SubscribeCreatedBy.svelte'

	export let teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]

	export let isLeader = false
</script>

{#if teams.length}
	<div class="grid gap-4 mt-2" style:grid-template-columns="repeat(auto-fill, minmax(325px, 1fr))">
		{#each teams as team}
			<CardLink href="/{team.eventId}/teams/{team.id}">
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
	</Placeholder>
{/if}

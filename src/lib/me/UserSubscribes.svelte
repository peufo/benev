<script lang="ts">
	import { formatRange } from '$lib/formatRange'
	import SubscribeState from '$lib/SubscribeState.svelte'
	import type { Event, Period, Subscribe, Team } from '@prisma/client'

	export let events: (Event & {
		teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]
	})[]

	export let title = 'Mes inscriptions'
	export let eventNameVisible = true
</script>

<div class="flex flex-col gap-10">
	{#if title}
		<h1 class="text-2xl">{title}</h1>
	{/if}

	{#each events as event}
		<section>
			{#if eventNameVisible}
				<a class="text-xl link link-hover" href="/{event.id}">{event.name}</a>
			{/if}
			<table class="table outline outline-base-200 outline-2" class:mt-3={eventNameVisible}>
				<tbody>
					{#each event.teams as team}
						<tr class="last:border-none relative hover">
							<td class="align-top pt-6 font-semibold rounded-l-box">
								<a href="/{event.id}/teams/{team.id}" class="absolute inset-0">{' '}</a>
								{team.name}
							</td>

							<td class="rounded-r-box">
								<table>
									<tbody>
										{#each team.periods as period}
											<tr>
												<td class="w-full">{formatRange(period)}</td>
												<td>
													<SubscribeState state={period.subscribes[0].state} />
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</section>
	{:else}
		<p class="text-center">
			Aucune inscription pour le moment
			<br />
			<br />
			<a href="/" class="btn"> Trouve un évenement </a>
		</p>
	{/each}
</div>

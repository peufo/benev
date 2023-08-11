<script lang="ts">
	import { formatRange } from '$lib/formatRange'
	import SubscribeState from '$lib/SubscribeState.svelte'
	import type { Event, Period, Subscribe, Team } from '@prisma/client'

	export let events: (Event & {teams: Team[]})[]
  export let subscribes: (Subscribe & {period: Period})[]

	const teamsIds = subscribes.map((s) => s.period.teamId)
	
</script>

<div class="flex flex-col gap-10">

	<h1 class="text-3xl">Mes inscriptions</h1>

	{#each events as event}
		<section>
			<a class="text-xl link link-hover" href="/{event.id}">{event.name}</a>

			<table class="table mt-3 outline outline-base-200 outline-2">
				<tbody>
					{#each event.teams.filter((t) => teamsIds.includes(t.id)) as team}
						{@const _subscribes = subscribes.filter((s) => s.period.teamId === team.id)}

						<tr class="last:border-none">
							<td class="align-top pt-6 font-semibold">
								<a href="/{event.id}/teams/{team.id}" class="link link-hover">{team.name}</a>
							</td>

							<td>
								<table>
									<tbody>
										{#each _subscribes as { period, state }}
											<tr>
												<td class="w-full">{formatRange(period)}</td>
												<td>
													<SubscribeState {state} />
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

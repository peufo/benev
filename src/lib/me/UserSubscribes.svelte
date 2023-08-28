<script lang="ts">
	import type { Event, Period, Subscribe, Team } from '@prisma/client'
	import { formatRange } from '$lib/formatRange'
	import SubscribeState from '$lib/SubscribeState.svelte'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'
	import { eventPath } from '$lib/store'
	import { Card, Placeholder } from '$lib/material'
	import { rowLink } from '$lib/action'

	export let events: (Event & {
		teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]
	})[]

	export let title = ''
	export let isEditor = false
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

			<table class="table outline outline-base-200 outline-2">
				<tbody>
					{#each event.teams as team}
						<tr
							class="last:border-none hover:bg-base-200/60 cursor-pointer"
							use:rowLink={{ href: `/${event.id}/teams/${team.id}`, addRowClasses: false }}
						>
							<td class="align-top pt-6 font-semibold rounded-l-box">
								{team.name}
							</td>

							<td class="rounded-r-box" data-prepend>
								<table>
									<tbody>
										{#each team.periods as period}
											<tr
												class={isEditor ? 'hover:bg-base-200/80' : ''}
												use:rowLink={{
													href: `/${event.id}/teams/${team.id}?periodOpen=${period.id}`,
													addRowClasses: false,
													enable: isEditor,
												}}
											>
												<td class="w-full">
													{formatRange(period)}
												</td>
												<td data-prepend>
													{#if isEditor}
														<SubscribeStateForm
															subscribe={period.subscribes[0]}
															action="{$eventPath}/teams/{period.teamId}"
														/>
													{:else}
														<SubscribeState state={period.subscribes[0].state} />
													{/if}
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
		</Card>
	{:else}
		<Placeholder>
			<span>Aucune inscription pour le moment</span>
			<br />
			<br />
			<a href="/" class="btn"> Trouve un évènement </a>
		</Placeholder>
	{/each}
</div>

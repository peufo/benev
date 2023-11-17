<script lang="ts">
	import { fade } from 'svelte/transition'
	import type { Member, Period, Team, Subscribe } from '@prisma/client'

	import { Placeholder, CardLink } from '$lib/material'
	import { eventPath, display, onlyAvailable } from '$lib/store'
	import { rowLink, tip } from '$lib/action'
	import Progress from '$lib/Progress.svelte'

	export let teams: (Team & {
		leaders: (Member & {
			user: { firstName: string; lastName: string; email: string; phone: string | null }
		})[]
		periods: (Period & { subscribes: Subscribe[] })[]
	})[]

	/** By pass $onlyAvailable flag */
	export let showAll = false

	$: _teams = teams
		.map((team) => ({
			...team,
			subscribes: team.periods.map((p) => p.subscribes).flat(),
			maxSubscribe: team.periods.map((p) => p.maxSubscribe).reduce((acc, cur) => acc + cur, 0),
		}))
		.filter((team) => {
			if (!$onlyAvailable || showAll) return true
			const nbSubscribes = team.subscribes.filter(
				({ state }) => state === 'request' || state === 'accepted'
			).length
			return nbSubscribes < team.maxSubscribe
		})
</script>

{#if _teams.length}
	{#if $display === 'list'}
		<div
			in:fade
			class="grid gap-4 mt-2"
			style:grid-template-columns="repeat(auto-fill, minmax(325px, 1fr))"
		>
			{#each _teams as team (team.id)}
				<CardLink title={team.name} href="{$eventPath}/teams/{team.id}" class="p-1">
					<div class="grid grid-cols-2 gap-2 items-start pt-2">
						<div class="flex flex-wrap gap-1">
							{#each team.leaders as member}
								<div
									class="badge badge-sm whitespace-nowrap"
									class:opacity-40={!member.isValidedByUser}
									use:tip={{
										content: "Ce membre n'a pas validé sa participation",
										disable: member.isValidedByUser,
									}}
								>
									{member.user.firstName}
									{member.user.lastName}
								</div>
							{/each}
						</div>
						<Progress
							class="mt-1"
							period={{ maxSubscribe: team.maxSubscribe, subscribes: team.subscribes }}
						/>
					</div>
				</CardLink>
			{/each}
		</div>
	{:else}
		<table in:fade class="table text-base">
			<thead>
				<tr>
					<th>Secteur</th>
					<th>Responsables</th>
					<th>Bénévoles</th>
				</tr>
			</thead>

			<tbody>
				{#each _teams as team (team.id)}
					<tr use:rowLink={{ href: `${$eventPath}/teams/${team.id}` }}>
						<td>
							{team.name}
						</td>
						<td data-prepend>
							{#each team.leaders as member}
								<span
									class="badge badge-sm whitespace-nowrap mr-1"
									class:opacity-40={!member.isValidedByUser}
									use:tip={{
										content: "Ce membre n'a pas validé sa participation",
										disable: member.isValidedByUser,
									}}
								>
									{member.user.firstName}
									{member.user.lastName}
								</span>
							{/each}
						</td>
						<td>
							<Progress
								class="mt-1"
								period={{ maxSubscribe: team.maxSubscribe, subscribes: team.subscribes }}
							/>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{:else}
	<Placeholder>
		<span>Pas de secteurs</span>
	</Placeholder>
{/if}

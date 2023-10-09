<script lang="ts">
	import { fade } from 'svelte/transition'
	import { Member, Period, Team, Subscribe } from '@prisma/client'

	import { Placeholder, CardLink } from '$lib/material'
	import { eventPath, display } from '$lib/store'
	import { rowLink, tip } from '$lib/action'
	import Progress from '$lib/Progress.svelte'
	import Leaders from '$lib/Leaders.svelte'

	export let teams: (Team & {
		leaders: (Member & {
			user: { firstName: string; lastName: string; email: string; phone: string | null }
		})[]
		periods: (Period & { subscribes: Subscribe[] })[]
	})[]
</script>

{#if teams.length}
	{#if $display === 'list'}
		<div class="@container">
			<ul in:fade class="grid gap-4 mt-6 @xl:grid-cols-2">
				{#each teams as team (team.id)}
					{@const subscribes = team.periods.map((p) => p.subscribes).flat()}
					{@const maxSubscribe = team.periods
						.map((p) => p.maxSubscribe)
						.reduce((acc, cur) => acc + cur, 0)}

					<CardLink href="{$eventPath}/teams/{team.id}">
						<span slot="title">
							{team.name}
						</span>

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
							<Progress period={{ maxSubscribe, subscribes }} class="mt-1" />
						</div>

					</CardLink>
				{/each}
			</ul>
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
				{#each teams as team (team.id)}
					{@const subscribes = team.periods.map((p) => p.subscribes).flat()}
					{@const maxSubscribe = team.periods
						.map((p) => p.maxSubscribe)
						.reduce((acc, cur) => acc + cur, 0)}

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
							<Progress period={{ maxSubscribe, subscribes }} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
{:else}
	<Placeholder>
		<span>Aucun secteur à charge</span>
	</Placeholder>
{/if}

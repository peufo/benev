<script lang="ts">
	import { fade } from 'svelte/transition'
	import { mdiClockTimeFourOutline, mdiFilterOutline } from '@mdi/js'
	import dayjs from 'dayjs'

	import type { TeamWithComputedValues } from '$lib/server'
	import type { Member, Event } from '@prisma/client'
	import { Placeholder, CardLink, Icon } from '$lib/material'
	import { eventPath, display, onlyAvailable } from '$lib/store'
	import { rowLink, tip } from '$lib/action'
	import Progress from '$lib/Progress.svelte'
	import { formatRange, formatRangeShort } from '$lib/formatRange'

	export let teams: (TeamWithComputedValues & {
		leaders: (Member & {
			user: { firstName: string; lastName: string; email: string; phone: string | null }
		})[]
	})[]
	export let event: Event

	/** By pass $onlyAvailable flag */
	export let showAll = false

	$: _teams = teams.filter((team) => {
		if (!$onlyAvailable || showAll) return true
		return team.isAvailable
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
				<CardLink href="{$eventPath}/teams/{team.id}" class="p-1">
					<div class="flex gap-2 items-center">
						<h2 class="font-medium">
							{team.name}
						</h2>
						<div class="grow"></div>
						{#if team.closeSubscribing && event.selfSubscribeAllowed}
							<span
								class="badge ml-auto opacity-80 z-10"
								use:tip={{
									content: `Fin des inscriptions le ${team.closeSubscribing.toLocaleDateString()}`,
								}}
							>
								<Icon path={mdiClockTimeFourOutline} size={16} />
								<span class="ml-1">
									{dayjs(team.closeSubscribing).format('DD MMMM')}
								</span>
							</span>
						{/if}

						{#if team.conditions?.length}
							<span class="badge opacity-80">
								<Icon path={mdiFilterOutline} size={16} />
								<span class="ml-1">
									{team.conditions.length}
									condition{team.conditions.length > 1 ? 's' : ''}
								</span>
							</span>
						{/if}
					</div>
					{#if team.range}
						<p class="text-xs opacity-60 font-semibold mt-1 mb-2">
							{formatRange(team.range)}
						</p>
					{/if}

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
							period={{
								maxSubscribe: team.maxSubscribes,
								subscribes: team.periods.map((p) => p.subscribes).flat(),
							}}
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
							<span>{team.name}</span>
							{#if team.range}
								<div class="text-xs opacity-60 font-semibold">
									{formatRange(team.range)}
								</div>
							{/if}
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
								period={{
									maxSubscribe: team.maxSubscribes,
									subscribes: team.periods.map((p) => p.subscribes).flat(),
								}}
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

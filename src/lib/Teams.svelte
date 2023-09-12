<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import { Member, Period, Team, User, Subscribe } from '@prisma/client'

	import { Icon, Placeholder } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { rowLink, tip } from '$lib/action'
	import Progress from '$lib/Progress.svelte'

	export let teams: (Team & {
		leaders: (Member & { user: { firstName: string; lastName: string } })[]
		periods: (Period & { subscribes: Subscribe[] })[]
	})[]
	export let isOwner: boolean
</script>

{#if teams.length}
	<table class="table text-base">
		<thead>
			<tr>
				<th>Secteur</th>
				<th>Responsables</th>
				<th>Bénévoles</th>
			</tr>
		</thead>

		<tbody>
			{#each teams as team}
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
								class="badge badge-sm whitespace-nowrap"
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

					{#if isOwner}
						<td class="py-0" data-prepend>
							<div class="flex justify-end z-10">
								<a class="btn btn-square btn-sm relative" href="{$eventPath}/teams/{team.id}/edit">
									<Icon path={mdiPencilOutline} />
								</a>
							</div>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
{:else}
	<Placeholder>
		<span>Aucun secteur à charge</span>
	</Placeholder>
{/if}

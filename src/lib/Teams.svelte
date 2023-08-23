<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import { Member, Period, Team, User, Subscribe } from '@prisma/client'

	import { Icon, Placeholder } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { rowLink } from './action'

	export let teams: (Team & {
		leaders: (Member & { user: User })[]
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
				{@const nbSubscribe = team.periods
					.map(
						(p) =>
							p.subscribes.filter((s) => s.state === 'request' || s.state === 'accepted').length
					)
					.reduce((acc, cur) => acc + cur, 0)}
				{@const maxSubscribe = team.periods
					.map((p) => p.maxSubscribe)
					.reduce((acc, cur) => acc + cur, 0)}

				<tr use:rowLink={{href: `${$eventPath}/teams/${team.id}`}}>
					<td>
						{team.name}
					</td>
					<td>
						{#each team.leaders as { user }}
							<span class="badge">{user.firstName} {user.lastName}</span>
						{/each}
					</td>
					<td>
						<progress
							class="progress max-w-[100px] w-[8vw]"
							value={nbSubscribe}
							max={maxSubscribe}
						/>

						<span class="whitespace-nowrap text-xs badge">
							{nbSubscribe} / {maxSubscribe}
						</span>
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

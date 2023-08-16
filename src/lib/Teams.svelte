<script lang="ts">
	import { mdiPencilOutline } from '@mdi/js'
	import { Member, Period, Team, User, Subscribe } from '@prisma/client'

	import { Icon } from '$lib/material'
	import { eventPath } from '$lib/store'

	export let teams: (Team & {
		leaders: (Member & { user: User })[]
		periods: (Period & { subscribes: Subscribe[] })[]
	})[]
	export let isOwner: boolean
</script>

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
					(p) => p.subscribes.filter((s) => s.state === 'request' || s.state === 'accepted').length
				)
				.reduce((acc, cur) => acc + cur, 0)}
			{@const maxSubscribe = team.periods
				.map((p) => p.maxSubscribe)
				.reduce((acc, cur) => acc + cur, 0)}

			<tr class="hover cursor-pointer relative">
				<td>
					{team.name}
					<a href="{$eventPath}/teams/{team.id}">
						<span class="inset-0 absolute" />
					</a>
				</td>
				<td>
					{team.leaders.map(({ user }) => `${user.firstName} ${user.lastName}`).join(', ')}
				</td>
				<td>
					<progress class="progress max-w-[100px] w-[8vw]" value={nbSubscribe} max={maxSubscribe} />

					<span class="whitespace-nowrap text-xs">
						{nbSubscribe}/{maxSubscribe}
					</span>
				</td>

				{#if isOwner}
					<td class="py-0">
						<div class="flex justify-end">
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

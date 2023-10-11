<script lang="ts">
	import type { PageData } from './$types'
	import { Placeholder } from '$lib/material'
	import { formatRange } from '$lib/formatRange'
	import { eventPath } from '$lib/store'
	import SubscribeStateForm from '$lib/SubscribeStateForm.svelte'

	export let subscribes: PageData['subscribes']

</script>

<div class="contents">
	<div class="table-wrapper">
		{#if subscribes.length}
			<table class="table table-pin-rows">
				<thead>
					<tr class="shadow">
						<th>Période</th>
						<th>Membre</th>
						<th>Secteur</th>
						<th>Statut</th>
						<th />
					</tr>
				</thead>

				<tbody>
					{#each subscribes as sub (sub.id)}
						<tr>
							<td>
								<a
									class="link link-hover"
									href="{$eventPath}/teams/{sub.period.teamId}/{sub.periodId}"
								>
									{formatRange(sub.period)}
								</a>
							</td>
							<td>
								<a class="link link-hover" href="{$eventPath}/admin/manage/members/{sub.memberId}">
									{sub.member.user.firstName}
									{sub.member.user.lastName}
								</a>
							</td>
							<td>
								<a class="link link-hover" href="{$eventPath}/teams/{sub.period.teamId}">
									{sub.period.team.name}
								</a>
							</td>

							<td>
								<SubscribeStateForm subscribe={sub} isLeader />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>

		{:else}
			<Placeholder>Aucune inscription trouvé</Placeholder>
		{/if}
	</div>
</div>

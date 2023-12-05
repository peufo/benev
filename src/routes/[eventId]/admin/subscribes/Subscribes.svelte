<script lang="ts">
	import { mdiAlertOutline } from '@mdi/js'
	import type { PageData } from './$types'
	import { Icon, Placeholder } from '$lib/material'
	import { formatRange } from '$lib/formatRange'
	import { eventPath } from '$lib/store'
	import { SubscribeCreatedBy, SubscribeMenu, SubscribeStateForm } from '$lib/subscribe'
	import Avatar from '$lib/me/Avatar.svelte'
	import {MemberRole} from '$lib/member'
	import { tip } from '$lib/action'
	
	export let subscribes: PageData['subscribes']
</script>

<div class="table-wrapper">
	{#if subscribes.length}
		<table class="table">
			<thead>
				<tr class="shadow">
					<th>Période</th>
					<th>Membre</th>
					<th>Secteur</th>
					<th>Inscription</th>
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
							<a
								class="link link-hover flex gap-2 items-center"
								href="{$eventPath}/admin/members/{sub.memberId}"
							>
								<Avatar user={sub.member.user} class="h-8 w-8 rounded border" />
								<span class="whitespace-nowrap">
									{sub.member.user.firstName}
									{sub.member.user.lastName}
								</span>
								<MemberRole roles={sub.member.roles} mode="icon" />

								{#if sub.isAbsent}
									<div use:tip={{ content: 'Absent à sa période de travail' }}>
										<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
									</div>
								{/if}
							</a>
						</td>
						<td>
							<a class="link link-hover" href="{$eventPath}/teams/{sub.period.teamId}">
								{sub.period.team.name}
							</a>
						</td>
						<td>
							<SubscribeCreatedBy createdBy={sub.createdBy} />
						</td>

						<td align="center">
							<SubscribeStateForm subscribe={sub} isLeader />
						</td>

						<td align="center">
							<SubscribeMenu subscribe={sub} />
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<Placeholder>Aucune inscription trouvé</Placeholder>
	{/if}
</div>

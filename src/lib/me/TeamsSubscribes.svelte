<script lang="ts">
	import { eventPath, withSearch } from '$lib/eventPath'
	import { resolve } from '$app/paths'
	import { TriangleAlertIcon } from '@lucide/svelte'
	import type { Member, Period, Subscribe, Tag, Team } from '@prisma/client'
	import { page } from '$app/stores'
	import { formatRange } from '$lib/formatRange'
	import { CardLink, Placeholder } from '$lib/ui'
	import { urlParam } from 'fuma'
	import { SubscribeCreatedBy, SubscribeMenu, SubscribeStateForm } from '$lib/subscribe'
	import { tip } from 'fuma'
	import TeamLeaders from '$lib/team/TeamLeaders.svelte'
	import { TagsList } from '$lib/tag'

	interface Props {
		teams: (Team & {
			leaders: Member[]
			periods: (Period & {
				subscribes: (Subscribe & { member: { userId: string | null } })[]
				tags: Tag[]
			})[]
		})[]
		isLeader?: boolean
	}

	let { teams, isLeader = false }: Props = $props()
</script>

{#if teams.length}
	<div class="flex flex-col gap-4">
		{#each teams as team (team.id)}
			<CardLink
				title={team.name}
				href={withSearch(
					resolve('/[eventId]/teams', { eventId: team.eventId }),
					`section=${team.id}#${team.id}`
				)}
			>
				{#each team.periods as period (period.id)}
					{@const subscribe = period.subscribes[0]}
					<div class="flex gap-2 items-center mt-2">
						<div
							class={[
								'grow flex gap-2 items-center px-2 py-2 rounded -ml-2',
								isLeader && 'relative z-10 hover:bg-base-200',
								isLeader && urlParam.has('form_period', period.id) && 'bg-base-200',
							]}
						>
							{#if isLeader}
								<a
									href={urlParam.toggle({ form_period: period.id })}
									class="absolute inset-0"
									data-sveltekit-replacestate
									data-sveltekit-noscroll
								>
									<!-- Espace explicite: le lien recouvre la carte et ne doit pas être vide. -->
									<!-- eslint-disable-next-line svelte/no-useless-mustaches -->
									{' '}
								</a>
							{/if}

							{#if subscribe.isAbsent}
								<div class="z-10" use:tip={{ content: 'Absent à la période de travail' }}>
									<TriangleAlertIcon class="text-warning" size={20} />
								</div>
							{/if}

							<span class="text-sm">{formatRange(period)}</span>
							<TagsList tags={period.tags} />
							<div class="grow"></div>
						</div>

						<SubscribeCreatedBy
							createdBy={subscribe.createdBy}
							size={22}
							class="btn-sm relative z-10"
						/>

						<SubscribeStateForm subscribe={period.subscribes[0]} canBeLarge {isLeader} />

						{#if isLeader}
							<SubscribeMenu {subscribe} />
						{/if}
					</div>
				{/each}
				<div class="relative z-10 border-t mt-2 border-soft">
					<span class="label text-xs">Responsable{team.leaders.length > 1 ? 's' : ''} </span>
					<div class="flex gap-2 gap-y-1 flex-wrap">
						<!-- BADGE LEADERS -->
						<TeamLeaders leaders={team.leaders} />
					</div>
				</div>
			</CardLink>
		{/each}
	</div>
{:else}
	<Placeholder>
		<span>Aucune inscription pour le moment</span>
		<br />
		{#if $page.params.eventId}
			{#if $page.data.event?.selfSubscribeAllowed}
				<a href={eventPath('/teams')} class="btn btn-primary"> Voir les secteurs </a>
			{/if}
		{:else}
			<a href={resolve('/')} class="btn"> Trouve un évènement </a>
		{/if}
	</Placeholder>
{/if}

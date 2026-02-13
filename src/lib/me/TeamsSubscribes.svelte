<script lang="ts">
	import type { Member, Period, Subscribe, Tag, Team } from '@prisma/client'
	import { page } from '$app/stores'
	import { formatRange } from '$lib/formatRange'
	import { CardLink, Icon, Placeholder, urlParam } from 'fuma'
	import { SubscribeCreatedBy, SubscribeMenu, SubscribeStateForm } from '$lib/subscribe'
	import { mdiAlertOutline } from '@mdi/js'
	import { tip } from 'fuma'
	import TeamLeaders from '$lib/team/TeamLeaders.svelte'
	import { TagsList } from '$lib/tag'

	export let teams: (Team & {
		leaders: Member[]
		periods: (Period & {
			subscribes: (Subscribe & { member: { isValidedByUser: boolean } })[]
			tags: Tag[]
		})[]
	})[]
	export let isLeader = false
</script>

{#if teams.length}
	<div class="flex flex-col gap-4">
		{#each teams as team}
			<CardLink title={team.name} href="/{team.eventId}/teams?section={team.id}#{team.id}">
				{#each team.periods as period}
					{@const subscribe = period.subscribes[0]}
					<div class="flex gap-2 items-center mt-2">
						<div
							class="
								grow flex gap-2 items-center px-2 py-2 rounded
								{isLeader ? 'relative z-10 hover:bg-base-200' : ''}
							"
							class:bg-base-200={isLeader && $urlParam.hasValue('form_period', period.id)}
						>
							{#if isLeader}
								<a
									href={$urlParam.toggle({ form_period: period.id })}
									class="absolute inset-0"
									data-sveltekit-replacestate
									data-sveltekit-noscroll
								>
									{' '}
								</a>
							{/if}

							{#if subscribe.isAbsent}
								<div class="z-10" use:tip={{ content: 'Absent à la période de travail' }}>
									<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
								</div>
							{/if}

							<span class="text-sm">{formatRange(period)}</span>
							<TagsList tags={period.tags} />
							<div class="grow" />
						</div>

						<SubscribeCreatedBy
							createdBy={subscribe.createdBy}
							size={22}
							class="btn-square btn-sm relative z-10"
						/>

						<SubscribeStateForm
							subscribe={period.subscribes[0]}
							eventId={team.eventId}
							canBeLarge
							{isLeader}
						/>

						{#if isLeader}
							<SubscribeMenu {subscribe} />
						{/if}
					</div>
				{/each}
				<div class="relative z-10">
					<span class="text-label text-xs">Responsable{team.leaders.length > 1 ? 's' : ''} : </span>
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
				<a href="/{$page.params.eventId}/teams" class="btn btn-primary"> Voir les secteurs </a>
			{/if}
		{:else}
			<a href="/" class="btn"> Trouve un évènement </a>
		{/if}
	</Placeholder>
{/if}

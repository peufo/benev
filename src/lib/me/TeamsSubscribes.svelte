<script lang="ts">
	import type { Period, Subscribe, Team } from '@prisma/client'
	import { page } from '$app/stores'
	import { formatRange } from '$lib/formatRange'
	import { CardLink, Icon, Placeholder, urlParam } from 'fuma'
	import { SubscribeCreatedBy, SubscribeMenu, SubscribeStateForm } from '$lib/subscribe'
	import { mdiAlertOutline } from '@mdi/js'
	import { tip } from 'fuma'

	export let teams: (Team & { periods: (Period & { subscribes: Subscribe[] })[] })[]

	export let isLeader = false
</script>

{#if teams.length}
	<div class="grid gap-4 mt-2" style:grid-template-columns="repeat(auto-fill, minmax(325px, 1fr))">
		{#each teams as team}
			<CardLink title={team.name} href="/{team.eventId}/teams/{team.id}">
				{#each team.periods as period}
					{@const subscribe = period.subscribes[0]}
					<div class="flex gap-1 items-center mt-2">
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

							<SubscribeCreatedBy createdBy={subscribe.createdBy} size={22} />

							{#if subscribe.isAbsent}
								<div class="z-10" use:tip={{ content: 'Absent à la période de travail' }}>
									<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
								</div>
							{/if}

							<span class="text-sm">{formatRange(period)}</span>
							<div class="grow" />
						</div>

						<SubscribeStateForm
							subscribe={period.subscribes[0]}
							eventId={team.eventId}
							{isLeader}
						/>

						{#if isLeader}
							<SubscribeMenu {subscribe} />
						{/if}
					</div>
				{/each}
			</CardLink>
		{/each}
	</div>
{:else}
	<Placeholder>
		<span>Aucune inscription pour le moment</span>
		<br />
		{#if $page.params.eventId}
			{#if $page.data.event?.selfSubscribeAllowed}
				<a href="/{$page.params.eventId}/teams" class="btn"> Voir les secteurs </a>
			{/if}
		{:else}
			<a href="/" class="btn"> Trouve un évènement </a>
		{/if}
	</Placeholder>
{/if}

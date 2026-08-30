<script lang="ts">
	import {
		ArrowLeftIcon,
		ChartGanttIcon,
		ClipboardCopyIcon,
		ClockIcon,
		PlusIcon,
		UsersIcon,
	} from '@lucide/svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import { tip, urlParam } from 'fuma'
	import { daytz } from '$lib/dayjs'
	import { eventPath } from '$lib/eventPath'
	import { formatRangeDate } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import Section from '$lib/ui/Section.svelte'
	import { Placeholder } from '$lib/ui'
	import { TeamForm } from '$lib/team'
	import TeamCloneButton from '$lib/team/TeamCloneButton.svelte'
	import TeamDeleteButton from '$lib/team/TeamDeleteButton.svelte'
	import TeamLeaders from '$lib/team/TeamLeaders.svelte'
	import { PeriodRow } from '$lib/period'
	import { MemberConditionsBadges } from '$lib/member'

	let { data } = $props()

	const team = $derived(data.team)
	// Dupliquer et supprimer passent tous deux par `permission.admin`: un responsable de secteur
	// édite le sien, mais ne le clone ni ne le supprime.
	const isAdmin = $derived(!!page.data.member?.roles.includes('admin') || !!page.data.userIsRoot)
	const total = $derived({
		maxSubscribe: team.periods.reduce((acc, p) => acc + p.maxSubscribe, 0),
		subscribes: team.periods.flatMap((p) => p.subscribes),
	})
	// L'entête de la section « secteur » est la même en édition et en lecture: le formulaire la
	// rend lui-même, les conditions devant partager son `<form>`.
	const teamSubtitle = $derived(
		team.range ? formatRangeDate(team.range) : 'Pas de périodes de travail'
	)
</script>

<a href={eventPath('/admin/teams')} class="btn btn-sm btn-ghost md:hidden my-3">
	<ArrowLeftIcon size={20} class="opacity-70" />
	<span>Tous les secteurs</span>
</a>

{#snippet teamActions()}
	<a
		href={eventPath(`/admin/members?subscribes_teams=["${team.id}"]`)}
		class="btn btn-square btn-sm"
		use:tip={{ content: 'Tous les membres du secteur' }}
	>
		<UsersIcon size={20} opacity={0.7} />
	</a>
	<a
		href={eventPath(`/admin/subscribes?teams=["${team.id}"]`)}
		class="btn btn-square btn-sm"
		use:tip={{ content: 'Toutes les inscriptions du secteur' }}
	>
		<ClipboardCopyIcon size={20} opacity={0.7} />
	</a>
	<a
		href={eventPath(`/admin/plan?teams=["${team.id}"]`)}
		class="btn btn-square btn-sm"
		use:tip={{ content: 'Voir le planning du secteur' }}
	>
		<ChartGanttIcon size={20} opacity={0.7} />
	</a>
	{#if isAdmin}
		<TeamDeleteButton {team} redirectTo={eventPath('/admin/teams')} />
		<TeamCloneButton
			{team}
			oncloned={(clone) => goto(eventPath('/admin/teams/[teamId]', { teamId: clone.id }))}
		/>
	{/if}
{/snippet}

<div class="grid gap-3 xl:grid-cols-2 items-start">
	{#if team.isLeader}
		{#key team.id}
			<TeamForm {team} event={data.event} saveBar subtitle={teamSubtitle} action={teamActions} />
		{/key}
	{:else}
		<Section id="team" title={team.name} subtitle={teamSubtitle} action={teamActions}>
			<div class="flex flex-col gap-4">
				{#if team.conditions?.length || (team.closeSubscribing && data.event.selfSubscribeAllowed)}
					<div class="flex flex-wrap gap-2 gap-y-1">
						{#if team.closeSubscribing && data.event.selfSubscribeAllowed}
							<span class="badge" class:badge-warning={team.isClosedSubscribing}>
								<ClockIcon size={16} />
								<span class="ml-1">
									Fin des inscriptions le {daytz(team.closeSubscribing).format('DD MMMM YYYY')}
								</span>
							</span>
						{/if}
						<MemberConditionsBadges
							conditions={team.conditions || []}
							memberFields={data.event.memberFields}
						/>
					</div>
				{/if}

				{#if team.description}
					<p class="text-sm whitespace-pre-line">{team.description}</p>
				{/if}

				<div class="border-t border-soft">
					<span class="label text-xs">Responsable{team.leaders.length > 1 ? 's' : ''}</span>
					<div class="flex flex-wrap gap-2 gap-y-1">
						<TeamLeaders leaders={team.leaders} />
					</div>
				</div>
			</div>
		</Section>
	{/if}

	<Section id="periods" title="Périodes de travail">
		{#snippet action()}
			<Progress period={total} class="mt-1 w-40" />
			{#if team.isLeader}
				<a
					href={urlParam.with({
						form_period: JSON.stringify({ team: { id: team.id, name: team.name } }),
					})}
					class="btn btn-square btn-sm btn-secondary"
					data-sveltekit-noscroll
					data-sveltekit-replacestate
					use:tip={{ content: 'Ajouter une période' }}
				>
					<PlusIcon />
				</a>
			{/if}
		{/snippet}
		<div>
			{#each team.periods as period (period.id)}
				<PeriodRow
					period={{ ...period, team }}
					onclickPeriod={() => {
						const url = urlParam.toggle({ form_period: period.id })
						return goto(url, { replaceState: true, noScroll: true, keepFocus: true })
					}}
				/>
			{:else}
				<Placeholder>Aucune période de travail</Placeholder>
			{/each}
		</div>
	</Section>
</div>

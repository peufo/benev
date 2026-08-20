<script lang="ts">
	import { MemberRole } from '$lib/member'
	import { EVENT_STATES } from '$lib/constant'
	import { tip } from 'fuma'
	import { CopyPlusIcon, MapPinnedIcon, ClockIcon } from '@lucide/svelte'
	import { EventIcon, EventPoster } from '$lib/event'
	import { formatDay, formatRangeDateShort, formatRangeHour } from '$lib/formatRange'
	import { locality } from '$lib/location/locality'
	import type { EventMember } from './types'

	interface Props {
		member: EventMember
	}

	let { member }: Props = $props()

	const STATE_SHORT: Record<string, string> = {
		draft: 'En construction',
		archived: 'Archivé',
	}

	const timeZone = $derived(member.event.timezone || undefined)
	let start = $derived(member.event.startDate)
	let end = $derived(member.event.endDate)
	let isOngoing = $derived(!!start && !!end && +start <= Date.now() && +end >= Date.now())
	let location = $derived(member.event.location as PrismaJson.Location | null)
	let next = $derived(member.nextSubscribe)
	let nbLeaderOf = $derived(member.leaderOf.length)

	let dateLabel = $derived(start ? formatRangeDateShort({ start, end }, timeZone) : '')
</script>

<li class="relative border-t border-soft transition-colors first:border-t-0 hover:bg-base-200/50">
	<div class="flex gap-4 px-2 py-5 sm:gap-5 sm:px-3">
		<!-- L'affiche est un actif réel de l'évènement: à cette échelle elle identifie
		     la ligne mieux que n'importe quelle pastille. -->
		<EventPoster event={member.event} class="h-28 w-20 shrink-0" fallbackClass="w-10" />

		<div class="flex min-w-0 grow flex-col gap-2">
			<div class="flex min-w-0 items-start gap-2">
				<div class="min-w-0 grow">
					<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
						{#if member.event.icon && member.event.posterId}
							<EventIcon icon={member.event.icon} alt="" class="h-5 w-5 shrink-0" />
						{/if}
						<a
							href="/{member.eventId}/me"
							class="text-lg leading-tight font-semibold wrap-break-word after:absolute after:inset-0 after:content-['']"
						>
							{member.event.name}
						</a>
						{#if isOngoing}
							<span class="badge badge-sm badge-primary">En cours</span>
						{:else if member.event.state !== 'published'}
							<span class="badge badge-ghost badge-sm">
								{STATE_SHORT[member.event.state] ?? EVENT_STATES[member.event.state].label}
							</span>
						{/if}
					</div>

					<div
						class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/70"
					>
						{#if dateLabel}
							<span class="whitespace-nowrap">{dateLabel}</span>
						{:else}
							<span>Dates à définir</span>
						{/if}
						{#if location?.label}
							<span class="inline-flex min-w-0 items-center gap-1" title={location.label}>
								<MapPinnedIcon size={14} class="shrink-0" />
								<span class="truncate">{locality(location.label)}</span>
							</span>
						{/if}
					</div>
				</div>

				{#if member.roles.includes('admin')}
					<a
						class="btn relative z-10 shrink-0 btn-square btn-ghost btn-sm"
						href="/me/events/clone/{member.eventId}"
						use:tip={{ content: "Cloner l'évènement" }}
					>
						<CopyPlusIcon size={18} opacity={0.6} />
						<span class="sr-only">Cloner {member.event.name}</span>
					</a>
				{/if}
			</div>

			<!-- Le prochain créneau est la réponse que le bénévole vient chercher: il est
			     détaché du reste, sur le fond sable qui porte déjà les invitations. -->
			{#if next}
				<div class="rounded-xl border border-soft bg-secondary/10 px-3 py-2">
					<div class="flex items-center gap-2 text-sm font-semibold text-primary">
						<ClockIcon size={15} class="shrink-0" />
						<span>
							{formatDay(next.start, timeZone)} · {formatRangeHour(
								{ start: next.start, end: next.end },
								timeZone
							)}
						</span>
					</div>
					<!-- Aligné sous le libellé: icône (15px) + gap (0.5rem) -->
					<div class="mt-0.5 pl-5.75 text-sm text-base-content/70">{next.teamName}</div>
				</div>
			{/if}

			<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/70">
				<span class="inline-flex items-center gap-0.5">
					<MemberRole roles={member.roles} mode="contents" iconSize={14} />
				</span>
				{#if member.nbSubscribesToCome}
					<span>
						{member.nbSubscribesToCome} créneau{member.nbSubscribesToCome > 1 ? 'x' : ''} à venir
					</span>
				{:else}
					<span>Pas d'inscription</span>
				{/if}
				{#if nbLeaderOf}
					<span>{nbLeaderOf} secteur{nbLeaderOf > 1 ? 's' : ''} à charge</span>
				{/if}
			</div>
		</div>
	</div>
</li>

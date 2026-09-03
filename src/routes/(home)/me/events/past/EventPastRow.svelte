<script lang="ts">
	import { resolve } from '$app/paths'
	import { eventHomePath } from '$lib/eventPath'
	import { MemberRole } from '$lib/member'
	import { tip } from 'fuma'
	import { CopyPlusIcon } from '@lucide/svelte'
	import { EventPoster } from '$lib/event'
	import { locality } from '$lib/location/locality'
	import type { EventMember } from '../types'

	interface Props {
		member: EventMember
	}

	let { member }: Props = $props()

	const timeZone = $derived(member.event.timezone || undefined)
	const dayFormater = $derived(
		new Intl.DateTimeFormat('fr-ch', {
			day: 'numeric',
			month: 'short',
			...(timeZone && { timeZone }),
		})
	)

	let start = $derived(member.event.startDate)
	let location = $derived(member.event.location as PrismaJson.Location | null)
	let nbSubscribes = $derived(member.subscribes.filter((s) => s.state === 'accepted').length)
</script>

<li
	class="
		relative flex items-center gap-3 border-t border-soft px-2 py-3
		transition-colors first:border-t-0 hover:bg-base-200/60 sm:gap-4 sm:px-3
	"
>
	<!-- L'année titre déjà la section: le bord ne porte que le jour. -->
	<div class="w-12 shrink-0 text-center text-sm text-base-content/70 sm:w-14">
		{start ? dayFormater.format(start) : '—'}
	</div>

	<EventPoster event={member.event} size="small" class="h-10 w-10 shrink-0" fallbackClass="w-6" />

	<div class="flex min-w-0 grow flex-col gap-0.5">
		<a
			href={eventHomePath(member.eventId, member.roles)}
			class="font-medium wrap-break-word after:absolute after:inset-0 after:content-['']"
		>
			{member.event.name}
		</a>
		<div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-base-content/70">
			<span class="inline-flex items-center gap-0.5">
				<MemberRole roles={member.roles} mode="contents" iconSize={14} />
			</span>
			{#if nbSubscribes}
				<span>{nbSubscribes} inscription{nbSubscribes > 1 ? 's' : ''}</span>
			{/if}
			{#if location?.label}
				<span class="min-w-0 truncate" title={location.label}>{locality(location.label)}</span>
			{/if}
		</div>
	</div>

	{#if member.roles.includes('admin')}
		<a
			class="btn relative z-10 shrink-0 btn-square btn-ghost btn-sm"
			href={resolve('/(home)/me/events/clone/[eventId]', { eventId: member.eventId })}
			use:tip={{ content: "Cloner l'évènement" }}
		>
			<CopyPlusIcon size={18} opacity={0.6} />
			<span class="sr-only">Cloner {member.event.name}</span>
		</a>
	{/if}
</li>

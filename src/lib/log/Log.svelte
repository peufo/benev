<script lang="ts" module>
	import type { Component } from 'svelte'
	import type { IconProps } from '@lucide/svelte'
	import {
		CalendarPlusIcon,
		ClipboardListIcon,
		FilePlus2Icon,
		FileSlidersIcon,
		MailCheckIcon,
		MailXIcon,
		MapPinnedIcon,
		PencilIcon,
		ShieldIcon,
		StickyNoteIcon,
		UserCheckIcon,
		UserMinusIcon,
		UserPlusIcon,
	} from '@lucide/svelte'
	import type { LogType } from '@prisma/client'
	import type { LogTyped } from './logMap'
	import LogSubscribe from './LogSubscribe.svelte'
	import LogMember from './LogMember.svelte'
	import LogMemberUpdate from './LogMemberUpdate.svelte'
	import LogMemberRole from './LogMemberRole.svelte'
	import LogEvent from './LogEvent.svelte'
	import LogTeam from './LogTeam.svelte'
	import LogPeriod from './LogPeriod.svelte'
	import LogNote from './LogNote.svelte'
	import LogEmail from './LogEmail.svelte'

	/**
	 * Exhaustive sur `LogType`, comme `logMap` l'est côté écriture: une valeur ajoutée à l'enum ne
	 * compile pas tant qu'elle n'a pas de quoi se rendre. Plusieurs types partagent un composant
	 * quand ils partagent une forme — la garantie tient au fait que la table soit complète, pas à
	 * ce qu'elle ait vingt entrées distinctes.
	 */
	const logComponents: {
		[T in LogType]: Component<{ log: LogTyped<T>; canDelete?: boolean; timezone?: string }>
	} = {
		subscribe_create: LogSubscribe,
		subscribe_state: LogSubscribe,
		subscribe_delete: LogSubscribe,
		subscribe_absent: LogSubscribe,
		member_invite: LogMember,
		member_join: LogMember,
		member_delete: LogMember,
		member_validated: LogMember,
		member_update: LogMemberUpdate,
		member_role: LogMemberRole,
		event_create: LogEvent,
		event_state: LogEvent,
		event_update: LogEvent,
		team_create: LogTeam,
		team_update: LogTeam,
		team_delete: LogTeam,
		period_create: LogPeriod,
		period_delete: LogPeriod,
		note_create: LogNote,
		email_sent: LogEmail,
		email_failed: LogEmail,
	}

	const logIcons: Record<LogType, { icon: Component<IconProps>; class: string }> = {
		subscribe_create: { icon: ClipboardListIcon, class: '' },
		subscribe_state: { icon: ClipboardListIcon, class: '' },
		subscribe_delete: { icon: ClipboardListIcon, class: 'text-error' },
		subscribe_absent: { icon: ClipboardListIcon, class: 'text-warning' },
		member_invite: { icon: UserPlusIcon, class: '' },
		member_join: { icon: UserPlusIcon, class: '' },
		member_delete: { icon: UserMinusIcon, class: 'text-error' },
		member_validated: { icon: UserCheckIcon, class: 'text-success' },
		member_update: { icon: PencilIcon, class: '' },
		member_role: { icon: ShieldIcon, class: '' },
		event_create: { icon: FilePlus2Icon, class: '' },
		event_state: { icon: FileSlidersIcon, class: '' },
		event_update: { icon: FileSlidersIcon, class: '' },
		team_create: { icon: MapPinnedIcon, class: '' },
		team_update: { icon: MapPinnedIcon, class: '' },
		team_delete: { icon: MapPinnedIcon, class: 'text-error' },
		period_create: { icon: CalendarPlusIcon, class: '' },
		period_delete: { icon: CalendarPlusIcon, class: 'text-error' },
		note_create: { icon: StickyNoteIcon, class: '' },
		email_sent: { icon: MailCheckIcon, class: 'text-success' },
		email_failed: { icon: MailXIcon, class: 'text-error' },
	}
</script>

<script lang="ts" generics="T extends LogType">
	import { tip } from 'fuma'
	import dayjs from '$lib/dayjs'
	import type { LogWithEvent } from './logTypes'

	let {
		log,
		canDelete = false,
		showEvent = false,
		timezone,
	}: {
		log: LogWithEvent
		canDelete?: boolean
		showEvent?: boolean
		/** Fuseau de l'évènement, pour les créneaux et les dates des diffs. */
		timezone?: string
	} = $props()

	// `log.type` discrimine `log.data`, mais seulement une fois les deux lus ensemble: le
	// composant est choisi par la table ci-dessus, qui garantit l'accord.
	let typed = $derived(log as LogTyped<T>)
	let LogContent = $derived(
		logComponents[typed.type] as Component<{
			log: LogTyped<T>
			canDelete?: boolean
			timezone?: string
		}>
	)
	let { icon: Icon, class: iconClass } = $derived(logIcons[log.type])
</script>

<li class="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-base-200/60">
	<span class="shrink-0 mt-0.5 {iconClass || 'text-base-content/70'}">
		<Icon size={18} />
	</span>

	<div class="grow min-w-0 text-sm">
		<LogContent log={typed} {canDelete} {timezone} />

		{#if showEvent && log.event}
			<a href="/{log.event.id}" class="link link-hover text-xs text-base-content/70">
				{log.event.name}
			</a>
		{/if}
	</div>

	<span
		class="shrink-0 text-xs text-base-content/70 whitespace-nowrap"
		use:tip={{ content: dayjs(log.createdAt).format('DD.MM.YYYY HH:mm:ss') }}
	>
		{dayjs(log.createdAt).format('HH:mm')}
	</span>
</li>

<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { ClassValue } from 'svelte/elements'
	import { ScrollTextIcon, XIcon } from '@lucide/svelte'
	import { tip, urlParam } from 'fuma'
	import { page } from '$app/state'
	import { InputOptionInParam } from '$lib/ui'
	import Section from '$lib/ui/Section.svelte'
	import { LOG_FAMILIES } from './logLabels'
	import { loadPreviousEventLogs } from './log.remote'
	import Logs from './Logs.svelte'
	import type { EventJournal } from './journal'

	interface Props {
		/** Ce que `getEventJournal` a servi: la fenêtre du fil et le filtre qui l'a produite. */
		journal: EventJournal
		/** Nommé en tête du fil quand celui-ci ne porte pas sur un membre. */
		title?: string
		timezone?: string
		/** Ajouté dans l'entête, après les filtres. */
		action?: Snippet
		/** Le fil remplit la section: c'est la page qui dit jusqu'où celle-ci monte. */
		class?: ClassValue
	}

	let { journal, title, timezone, action: extraAction, class: klass }: Props = $props()

	const families = Object.fromEntries(
		Object.entries(LOG_FAMILIES).map(([value, { label }]) => [value, label])
	)

	let isAdmin = $derived(!!page.data.member?.roles.includes('admin') || !!page.data.userIsRoot)
	let subjectName = $derived(
		journal.subject ? `${journal.subject.firstName} ${journal.subject.lastName}` : undefined
	)
</script>

<Section id="journal" title="Journal" icon={ScrollTextIcon} class={['flex flex-col', klass]}>
	{#snippet action()}
		{#if journal.subject && !journal.pinned}
			<a
				href={urlParam.without('memberId')}
				class="btn btn-sm"
				data-sveltekit-noscroll
				use:tip={{ content: 'Retirer le filtre' }}
			>
				<XIcon size={18} />
				{subjectName}
			</a>
		{/if}
		<InputOptionInParam key="family" options={families} />
		{@render extraAction?.()}
	{/snippet}

	<!-- Un filtre différent, c'est un autre ensemble: le fil repart neuf plutôt que d'empiler
	     ce qui avait été chargé au-dessus de l'ancien. -->
	{#key JSON.stringify(journal.filter)}
		<Logs
			logs={journal.logs}
			hasMore={journal.hasMore}
			title={subjectName ?? title}
			{timezone}
			showNoteForm={isAdmin}
			noteMemberId={journal.subject?.id}
			loadPrevious={(beforeId) => loadPreviousEventLogs({ beforeId, ...journal.filter })}
			canDeleteNote={(log) =>
				log.type === 'note_create' && (isAdmin || log.createdById === page.data.member?.userId)}
		/>
	{/key}
</Section>

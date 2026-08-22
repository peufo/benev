<script lang="ts">
	import { ClipboardCheckIcon, ScrollTextIcon, TableIcon, UsersIcon, XIcon } from '@lucide/svelte'
	import { tip, urlParam } from 'fuma'
	import { page } from '$app/state'
	import { InputOptionInParam } from '$lib/ui'
	import Section from '$lib/ui/Section.svelte'
	import { LOG_FAMILIES, Logs, loadPreviousEventLogs } from '$lib/log'
	import { eventPath } from '$lib/store'
	import DashboardMembers from './DashboardMembers.svelte'
	import DashboardValidations from './DashboardValidations.svelte'
	import { WAITING, waitingOf } from './waiting'

	let { data } = $props()

	const families = Object.fromEntries(
		Object.entries(LOG_FAMILIES).map(([value, { label }]) => [value, label])
	)

	let isAdmin = $derived(!!page.data.member?.roles.includes('admin'))
	let subjectName = $derived(
		data.journal?.subject
			? `${data.journal.subject.firstName} ${data.journal.subject.lastName}`
			: undefined
	)

	// La table des inscriptions filtrée sur ce que la section montre: le bouton mène à la suite
	// de la même liste, pas à tout l'évènement.
	let waitingTableHref = $derived(
		`${$eventPath}/admin/subscribes?states=${JSON.stringify(['request'])}` +
			`&createdBy=${waitingOf(data.waiting).createdBy}`
	)
</script>

<div class={['lg:grid lg:grid-cols-2', 'max-lg:flex max-lg:flex-col', 'gap-3']}>
	<div class="flex flex-col gap-3">
		<Section
			id="members"
			title="Derniers adhérents"
			icon={UsersIcon}
			subtitle="{data.nbMembers} adhérent{data.nbMembers > 1 ? 's' : ''} à ce jour"
			class="border-soft"
		>
			{#snippet action()}
				<a
					href="{$eventPath}/admin/members"
					class="btn btn-square btn-sm"
					use:tip={{ content: 'Ouvrir la table des membres' }}
				>
					<TableIcon size={20} />
				</a>
			{/snippet}
			<DashboardMembers members={data.lastMembers} />
		</Section>

		<Section
			id="validations"
			title="Inscriptions en attente"
			icon={ClipboardCheckIcon}
			subtitle="{data.nbSubscribes} inscription{data.nbSubscribes > 1
				? 's'
				: ''} sur les {data.maxSubscribes} attendues"
		>
			{#snippet action()}
				<div class="join">
					{#each WAITING as { key, label } (key)}
						<a
							href={urlParam.with({ waiting: key })}
							class={['btn btn-sm join-item', data.waiting === key && 'btn-primary']}
							data-sveltekit-noscroll
						>
							{label}
							<span class="badge badge-xs">{data.nbWaiting[key]}</span>
						</a>
					{/each}
				</div>
				<a
					href={waitingTableHref}
					class="btn btn-square btn-sm"
					use:tip={{ content: 'Ouvrir la table des inscriptions' }}
				>
					<TableIcon size={20} />
				</a>
			{/snippet}
			<DashboardValidations subscribes={data.toValidate} waiting={data.waiting} />
		</Section>
	</div>

	<Section id="journal" title="Journal" icon={ScrollTextIcon}>
		{#snippet action()}
			{#if data.journal.subject}
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
		{/snippet}

		<!-- Un filtre différent, c'est un autre ensemble: le fil repart neuf plutôt que d'empiler
					 ce qui avait été chargé au-dessus de l'ancien. -->
		{#key `${data.journal.family}:${data.journal.subject?.id}`}
			<Logs
				logs={data.journal.logs}
				hasMore={data.journal.hasMore}
				title={subjectName ?? data.event?.name}
				timezone={data.event?.timezone}
				showNoteForm={isAdmin}
				noteMemberId={data.journal.subject?.id}
				loadPrevious={(beforeId) =>
					loadPreviousEventLogs({
						beforeId,
						family: data.journal.family,
						memberId: data.journal.subject?.id,
					})}
				canDeleteNote={(log) =>
					log.type === 'note_create' && (isAdmin || log.createdById === page.data.member?.userId)}
			/>
		{/key}
	</Section>
</div>

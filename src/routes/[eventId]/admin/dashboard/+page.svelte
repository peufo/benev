<script lang="ts">
	import { ClipboardCheckIcon, ScrollTextIcon, SigmaIcon, UsersIcon, XIcon } from '@lucide/svelte'
	import { tip, urlParam } from 'fuma'
	import { page } from '$app/state'
	import { InputOptionInParam } from '$lib/ui'
	import Section from '$lib/ui/Section.svelte'
	import { LOG_FAMILIES, Logs, loadPreviousEventLogs } from '$lib/log'
	import { DASHBOARD_SECTIONS, trackSubNavSections } from '$lib/layout/adminSubNav.svelte'
	import { eventPath } from '$lib/store'
	import DashboardStats from './DashboardStats.svelte'
	import DashboardMembers from './DashboardMembers.svelte'
	import DashboardValidations from './DashboardValidations.svelte'

	let { data } = $props()

	// La navigation de second niveau vit dans le rail admin: la page se contente de lui
	// signaler quelle section est à l'écran.
	trackSubNavSections(DASHBOARD_SECTIONS)

	const families = Object.fromEntries(
		Object.entries(LOG_FAMILIES).map(([value, { label }]) => [value, label])
	)

	let isAdmin = $derived(!!page.data.member?.roles.includes('admin'))
	let subjectName = $derived(
		data.subject ? `${data.subject.firstName} ${data.subject.lastName}` : undefined
	)
</script>

<div class="max-w-4xl mx-auto w-full space-y-4">
	<Section id="stats" title="Chiffres clés" icon={SigmaIcon}>
		<DashboardStats stats={data.stats} />
	</Section>

	<Section
		id="members"
		title="Derniers adhérents"
		icon={UsersIcon}
		subtitle="Qui a rejoint l'évènement en dernier"
	>
		{#snippet action()}
			<a href="{$eventPath}/admin/members" class="btn btn-sm">Tous les membres</a>
		{/snippet}
		<DashboardMembers members={data.lastMembers} />
	</Section>

	<Section
		id="validations"
		title="Inscriptions à valider"
		icon={ClipboardCheckIcon}
		subtitle="Les demandes des bénévoles qu'un responsable n'a pas encore tranchées"
	>
		{#snippet action()}
			{#if data.nbToValidate > data.toValidate.length}
				<a
					href="{$eventPath}/admin/subscribes?states={JSON.stringify(['request'])}&createdBy=user"
					class="btn btn-sm"
				>
					Les {data.nbToValidate} demandes
				</a>
			{/if}
		{/snippet}
		<DashboardValidations subscribes={data.toValidate} />
	</Section>

	<Section id="journal" title="Journal" icon={ScrollTextIcon}>
		{#snippet action()}
			{#if data.subject}
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
		{#key `${data.family}:${data.subject?.id}`}
			<Logs
				logs={data.logs}
				hasMore={data.hasMore}
				title={subjectName ?? data.event?.name}
				timezone={data.event?.timezone}
				showNoteForm={isAdmin}
				noteMemberId={data.subject?.id}
				loadPrevious={(beforeId) =>
					loadPreviousEventLogs({ beforeId, family: data.family, memberId: data.subject?.id })}
				canDeleteNote={(log) =>
					log.type === 'note_create' && (isAdmin || log.createdById === page.data.member?.userId)}
			/>
		{/key}
	</Section>
</div>

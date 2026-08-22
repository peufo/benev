<script lang="ts">
	import { ClipboardCheckIcon, ScrollTextIcon, UsersIcon, XIcon } from '@lucide/svelte'
	import { tip, urlParam } from 'fuma'
	import { page } from '$app/state'
	import { InputOptionInParam } from '$lib/ui'
	import Section from '$lib/ui/Section.svelte'
	import { LOG_FAMILIES, Logs, loadPreviousEventLogs } from '$lib/log'
	import { dashboardSections, trackSubNavSections } from '$lib/layout/adminSubNav.svelte'
	import { eventPath } from '$lib/store'
	import DashboardMembers from './DashboardMembers.svelte'
	import DashboardValidations from './DashboardValidations.svelte'

	let { data } = $props()

	// La navigation de second niveau vit dans le rail admin: la page se contente de lui
	// signaler quelle section est à l'écran.
	trackSubNavSections(() => dashboardSections(!!data.journal))

	const families = Object.fromEntries(
		Object.entries(LOG_FAMILIES).map(([value, { label }]) => [value, label])
	)

	let isAdmin = $derived(!!page.data.member?.roles.includes('admin'))
	let subjectName = $derived(
		data.journal?.subject
			? `${data.journal.subject.firstName} ${data.journal.subject.lastName}`
			: undefined
	)
</script>

<div class={['lg:grid lg:grid-cols-2', 'max-lg:flex max-lg:flex-col', 'gap-3']}>
	<div class="flex flex-col gap-3">
		<Section
			id="members"
			title="Derniers adhérents"
			icon={UsersIcon}
			subtitle="Qui a rejoint l'évènement en dernier"
			class="border-soft"
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

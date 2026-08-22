<script lang="ts">
	import { XIcon } from '@lucide/svelte'
	import { urlParam } from 'fuma'
	import { page } from '$app/state'
	import { Card, InputOptionInParam } from '$lib/ui'
	import { LOG_FAMILIES, Logs, loadPreviousEventLogs } from '$lib/log'

	let { data } = $props()

	const families = Object.fromEntries(
		Object.entries(LOG_FAMILIES).map(([value, { label }]) => [value, label])
	)

	let isAdmin = $derived(!!page.data.member?.roles.includes('admin'))
	let subjectName = $derived(
		data.subject ? `${data.subject.firstName} ${data.subject.lastName}` : undefined
	)
</script>

<Card class="max-w-4xl mx-auto w-full">
	<div class="flex items-center flex-wrap gap-2 mb-4">
		<h2 class="title grow">Journal</h2>
		<InputOptionInParam key="family" options={families} />
	</div>

	{#if data.subject}
		<a href={urlParam.without('memberId')} class="btn btn-sm w-max mb-4" data-sveltekit-noscroll>
			<XIcon size={18} />
			{subjectName}
		</a>
	{/if}

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
</Card>

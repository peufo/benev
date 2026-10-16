<script lang="ts">
	import type { Event, EventState } from '@prisma/client'
	import { EVENT_STATES } from '#lib/constant/index.js'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import { ArchiveIcon } from '@lucide/svelte'
	import { keepEventOpen, setEventState } from './event.remote'
	import { enhanceForm } from '#lib/enhanceForm.js'
	import dayjs from '#lib/dayjs.js'
	import { archiveDueAt } from '#lib/event/eventArchive.js'

	interface Props {
		event: Event & { owner: { firstName: string; lastName: string } }
		isOwner: boolean
	}

	let { event, isOwner }: Props = $props()

	function getNextStates(): Record<EventState, { state: EventState; label: string }[]> {
		return {
			draft: [{ state: 'published', label: 'Publier' }],
			published: [
				{ state: 'draft', label: 'Repasser en brouillon' },
				{ state: 'archived', label: 'Archiver' },
			],
			archived: [{ state: 'published', label: 'Republier' }],
		}
	}

	function handleClickState(e: MouseEvent | KeyboardEvent) {
		if (!page.data.userIsRoot && !page.data.member?.roles.includes('owner')) {
			e.preventDefault()
			const owner = `${event.owner.firstName} ${event.owner.lastName}`
			toast.warning(`Seul ${owner}, propriétaire de l'évènement, peut changer son statut`)
		}
	}
	const StateIcon = $derived(EVENT_STATES[event.state].icon)
	const archiveAt = $derived(archiveDueAt(event))
	const canKeepOpen = $derived(page.data.userIsRoot || page.data.member?.roles.includes('owner'))
</script>

<div class={['flex gap-4 flex-wrap items-start', 'border border-soft rounded-box p-1']}>
	<div class="flex gap-4 items-center pl-4 py-2">
		<StateIcon class={['shrink-0', [EVENT_STATES[event.state].class]]} size={42} />

		<div>
			<h3 class="title-md">{EVENT_STATES[event.state].label}</h3>
			<p class="text-sm opacity-80 mt-1">
				{EVENT_STATES[event.state].description}
			</p>
		</div>
	</div>

	{#if event.state == 'draft' && !isOwner}
		<p class="badge badge-warning gap-1">
			<b>{event.owner.firstName}</b>
			doit publier l'évènement.
		</p>
	{:else}
		<div class="flex gap-2 justify-end grow items-center pt-1 pr-1">
			{#each getNextStates()[event.state] as { state, label } (state)}
				<!-- Un `<form>` par transition: `.for()` leur donne à chacun son instance -->
				{@const stateForm = setEventState.for(state)}
				<form
					{...stateForm.enhance(enhanceForm({ success: EVENT_STATES[state].label }))}
					class="contents"
				>
					<input {...stateForm.fields.state.as('hidden', state)} />
					<button
						class="btn btn-sm btn-primary"
						onclick={handleClickState}
						onkeydown={handleClickState}
					>
						{label}
					</button>
				</form>
			{/each}
		</div>
	{/if}
</div>

{#if event.state === 'published' && archiveAt}
	<div class="flex gap-4 flex-wrap items-center border border-soft rounded-box p-1 pl-4">
		<ArchiveIcon class="shrink-0 text-warning" size={20} />
		<p class="text-sm grow py-2">
			Faute d'activité, l'évènement sera archivé automatiquement le
			<b>{dayjs(archiveAt).tz(event.timezone).format('D MMMM YYYY')}</b>.
		</p>
		{#if canKeepOpen}
			<form {...keepEventOpen.enhance(enhanceForm({ success: 'Évènement gardé ouvert' }))}>
				<button class="btn btn-sm">Garder ouvert</button>
			</form>
		{:else}
			<p class="text-sm opacity-80 pr-3 py-2">
				<b>{event.owner.firstName}</b> peut le garder ouvert.
			</p>
		{/if}
	</div>
{/if}

<script lang="ts">
	import type { Event, EventState } from '@prisma/client'
	import { EVENT_STATES } from '$lib/constant'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import { setEventState } from './event.remote'
	import { enhanceForm } from '$lib/enhanceForm'

	interface Props {
		event: Event & { owner: { firstName: string } }
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
			const owner = `${page.data.member?.firstName} ${page.data.member?.lastName}`
			toast.warning(`Seul le propriétaire, ${owner}, peut changer le status de cet évènement`)
		}
	}
	const StateIcon = $derived(EVENT_STATES[event.state].icon)
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
				<form
					{...setEventState.for(state).enhance(enhanceForm({ success: EVENT_STATES[state].label }))}
					class="contents"
				>
					<input type="hidden" name="state" value={state} />
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

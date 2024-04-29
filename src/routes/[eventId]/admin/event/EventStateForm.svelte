<script lang="ts">
	import type { Event, EventState } from '@prisma/client'
	import type { PageData } from './$types'
	import { useForm } from '$lib/validation'
	import { EVENT_STATES } from '$lib/constant'
	import { Icon } from 'fuma'
	import { eventPath } from '$lib/store'
	import { enhance } from '$app/forms'
	import { PUBLIC_FREE_EVENT_MAX_MEMBERS } from '$env/static/public'
	import { tip } from '$lib/action'
	import { page } from '$app/stores'
	import { useNotify } from '$lib/notify'
	import { goto } from '$app/navigation'

	export let event: Event
	export let eventCounts: PageData['eventCounts']
	export let eventLicenceAvailable: boolean

	$: nextStates = getNextStates(eventLicenceAvailable)
	function getNextStates(
		_eventLicenceAvailable: boolean
	): Record<EventState, { state: EventState; label: string }[]> {
		return {
			draft: [
				{ state: 'actived', label: _eventLicenceAvailable ? 'Activer' : 'Obtenir une licence' },
			],
			actived: [
				{ state: 'published', label: 'Publier' },
				{ state: 'archived', label: 'Archiver' },
			],
			published: [
				{ state: 'actived', label: 'Maintenance' },
				{ state: 'archived', label: 'Archiver' },
			],
			archived: [{ state: 'published', label: 'Republier' }],
		}
	}

	const notify = useNotify()

	function handleClickLicence(e: MouseEvent | KeyboardEvent) {
		if (!$page.data.member?.roles.includes('owner')) {
			e.preventDefault()
			const owner = `${$page.data.member!.user.firstName} ${$page.data.member!.user.lastName}`
			notify.warning(`Seul le propriétaire, ${owner}, peut obtenir des licences pour cet évènement`)
		}
	}

	function handleClickState(e: MouseEvent | KeyboardEvent, newState: EventState) {
		if (!$page.data.member?.roles.includes('owner')) {
			e.preventDefault()
			const owner = `${$page.data.member!.user.firstName} ${$page.data.member!.user.lastName}`
			notify.warning(`Seul le propriétaire, ${owner}, peut changer le status de cet évènement`)
		}
		if (event.state === 'draft' && !eventLicenceAvailable) {
			e.preventDefault()
			goto(
				`/me/licences/checkout?return_url=${$eventPath}/admin/event?checkoutId={CHECKOUT_SESSION_ID}`
			)
		}
	}
</script>

<div
	class="
    md:px-8 p-4 rounded-lg border flex flex-col gap-3 bg-base-100
    {EVENT_STATES[event.state].class}
  "
>
	<div>
		<div class="flex gap-2 items-center flex-wrap">
			<Icon
				path={EVENT_STATES[event.state].icon}
				class="opacity-80 {event.state === 'draft' ? 'rotate-12' : ''}"
			/>
			<h3 class="title">{EVENT_STATES[event.state].label}</h3>
			<div class="grow" />

			{#if event.state === 'draft'}
				<div
					use:tip={{
						content: `${eventCounts.membersValided} membres validés pour ${PUBLIC_FREE_EVENT_MAX_MEMBERS} possibles`,
					}}
					role="progressbar"
					class="radial-progress bg-warning text-xs opacity-80"
					style="--value:{(eventCounts.membersValided / +PUBLIC_FREE_EVENT_MAX_MEMBERS) *
						100}; --size: 3rem;"
				>
					{eventCounts.membersValided} / {PUBLIC_FREE_EVENT_MAX_MEMBERS}
				</div>
			{:else}
				{@const maxMembers = eventCounts.membersLicenced + eventCounts.memberLicencesAvailable}
				{@const content = event.missingLicencesMember
					? `Il manque ${event.missingLicencesMember} licences de membre`
					: eventCounts.memberLicencesAvailable
					? `Encore ${eventCounts.memberLicencesAvailable} licences de membre disponibles`
					: `Pas de licence de membre disponible`}

				<a
					href="/me/licences"
					on:click={handleClickLicence}
					on:keydown={handleClickLicence}
					use:tip={{ content }}
				>
					<div
						role="progressbar"
						class="
							radial-progress text-xs opacity-80
							{event.missingLicencesMember ? 'text-error opacity-100' : ''}
						"
						style="--value:{(eventCounts.membersLicenced / maxMembers) * 100}; --size: 3rem;"
					>
						{eventCounts.membersLicenced + event.missingLicencesMember} / {maxMembers}
					</div>
				</a>
			{/if}
		</div>

		<p class="text-sm opacity-80 mt-1">
			{@html EVENT_STATES[event.state].description}
		</p>
	</div>

	<div class="flex gap-2 justify-end grow">
		{#each nextStates[event.state] as { state, label }}
			{@const form = useForm()}
			<form
				use:enhance={form.submit}
				action="{$eventPath}/admin/event?/set_state_event"
				method="post"
				class="contents"
			>
				<input type="hidden" name="state" value={state} />
				<button
					class="btn btn-sm btn-primary"
					on:click={(e) => handleClickState(e, state)}
					on:keydown={(e) => handleClickState(e, state)}
				>
					{label}
				</button>
			</form>
		{/each}
	</div>
</div>

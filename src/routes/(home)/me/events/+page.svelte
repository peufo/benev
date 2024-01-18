<script lang="ts">
	import { EventForm } from '$lib/event'
	import { Dialog, Icon, Placeholder } from '$lib/material'
	import { mdiPlus } from '@mdi/js'
	import MemberCard from './MemberCard.svelte'
	import { IsOrganizerForm } from '$lib/me'

	export let data

	let createDialog: HTMLDialogElement
	let isOrganizerDialog: HTMLDialogElement
	function handleClickNewEvent() {
		if (data.user.isOrganizer) createDialog.showModal()
		else isOrganizerDialog.showModal()
	}
</script>

<!-- INVITATIONS -->
{#if data.members.filter((m) => !m.isValidedByUser).length}
	<h2 class="title">Invitations</h2>
	<div class="grid grid-cols-2 gap-4">
		{#each data.members.filter((m) => !m.isValidedByUser) as member}
			<MemberCard {member} />
		{/each}
	</div>
{/if}

<!-- MES EVENEMENTS -->
<div class="flex gap-2 justify-between items-center mb-3">
	<h2 class="title">Mes évènements</h2>
	<button
		class="btn btn-ghost"
		class:btn-ghost={!data.user.isOrganizer}
		class:text-primary={!data.user.isOrganizer && !data.members.length}
		class:btn-primary={data.user.isOrganizer && !data.members.length}
		on:click={handleClickNewEvent}
	>
		<Icon path={mdiPlus} />
		Organiser
	</button>
</div>

<div class="flex flex-col gap-3">
	{#each data.members.filter((m) => m.isValidedByUser) as member}
		<MemberCard {member} />
	{:else}
		<Placeholder class="gap-3 bg-base-300">
			<p class="text-center">Tu n'es membre d'aucun évènement pour l'instant.</p>
			<a href="/events" class="btn btn-ghost"> Trouver un évènement </a>
		</Placeholder>
	{/each}
</div>

<Dialog bind:dialog={isOrganizerDialog}>
	<h2 slot="header" class="card-title">Devenir organisateur</h2>
	<IsOrganizerForm
		on:cancel={() => isOrganizerDialog.close()}
		on:success={() => {
			isOrganizerDialog.close()
			createDialog.showModal()
		}}
	/>
</Dialog>

<Dialog bind:dialog={createDialog}>
	<h2 slot="header" class="card-title">Nouvel évènement</h2>
	<EventForm on:cancel={() => createDialog.close()} on:success={() => createDialog.close()} />
</Dialog>

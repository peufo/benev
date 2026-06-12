<script lang="ts">
	import { goto } from '$app/navigation'
	import { Dialog, Icon, Placeholder } from 'fuma'
	import { mdiPlus } from '@mdi/js'
	import EventMemberCard from './EventMemberCard.svelte'
	import { IsOrganizerForm } from '$lib/me'

	export let data

	let becomeOrganizerDialog: HTMLDialogElement
</script>

<!-- INVITATIONS -->
{#if data.members.filter((m) => !m.isValidedByUser).length}
	<h2 class="title">Invitations</h2>
	<div class="flex flex-col gap-3 mb-4">
		{#each data.members.filter((m) => !m.isValidedByUser) as member}
			<EventMemberCard {member} />
		{/each}
	</div>
{/if}

<!-- MES EVENEMENTS -->
<div class="flex gap-2 justify-between items-center mb-3">
	<h2 class="title">Mes évènements</h2>

	{#if data.user.isOrganizer}
		<a
			href="/me/events/create"
			class="btn"
			class:btn-primary={!data.members.length}
			class:btn-ghost={data.members.length > 0}
		>
			<Icon path={mdiPlus} class={!data.members.length ? 'fill-primary-content' : ''} />
			Organiser
		</a>
	{:else}
		<button
			class="btn btn-ghost"
			class:text-primary={!data.members.length}
			on:click={() => becomeOrganizerDialog.showModal()}
		>
			<Icon path={mdiPlus} />
			Organiser
		</button>
	{/if}
</div>

<div class="flex flex-col gap-3">
	{#each data.members.filter((m) => m.isValidedByUser) as member}
		<EventMemberCard {member} />
	{:else}
		<Placeholder class="gap-3 bg-base-300">
			<p class="text-center">Tu n'es membre d'aucun évènement pour l'instant.</p>
		</Placeholder>
		<div class="text-center">
			<a href="/events" class="btn btn-primary"> Trouver un évènement </a>
		</div>
	{/each}
</div>

<Dialog bind:dialog={becomeOrganizerDialog}>
	<h2 slot="header" class="card-title">Devenir organisateur</h2>
	<IsOrganizerForm
		on:cancel={() => becomeOrganizerDialog.close()}
		on:success={() => {
			becomeOrganizerDialog.close()
			goto('/me/events/create')
		}}
	/>
</Dialog>

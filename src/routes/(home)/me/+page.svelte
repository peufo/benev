<script lang="ts">
	import { mdiLogout, mdiPlus } from '@mdi/js'
	import EventForm from '$lib/EventForm.svelte'
	import { Dialog, Icon, Placeholder } from '$lib/material'
	import ProfileSection from '$lib/me/ProfileSection.svelte'
	import { useNotify } from '$lib/notify'
	import DeleteUserForm from './DeleteUserForm.svelte'
	import ProfileForm from '$lib/me/ProfileForm.svelte'
	import MemberCard from './MemberCard.svelte'

	export let data

	let createDialog: HTMLDialogElement
	const notify = useNotify()
	function handleClickNewEvent() {
		// TODO: Réparer les envois d'email
		if (false && !data.user?.isEmailVerified) {
			notify.warning(`Tu dois d'abord valider ton email`)
			return
		}

		createDialog.showModal()
	}
</script>

<div class="max-w-2xl mx-auto">
	<ProfileSection user={data.user}>
		<ProfileForm user={data.user} />
		<hr />
		<DeleteUserForm />
	</ProfileSection>

	<!-- INVITATIONS -->
	{#if data.members.filter((m) => !m.isValidedByUser).length}
		<h2 class="text-xl font-semibold text-base-content/70 mt-4">Invitations</h2>
		{#each data.members.filter((m) => !m.isValidedByUser) as member}
			<MemberCard {member} />
		{/each}
	{/if}

	<!-- MES EVENEMENTS -->
	<div class="flex gap-2 justify-between items-center mt-8">
		<h2 class="text-xl font-semibold text-base-content/70">Mes évenements</h2>
		<button class="btn" class:btn-secondary={!data.members.length} on:click={handleClickNewEvent}>
			<Icon path={mdiPlus} class={data.members.length ? '' : 'fill-secondary-content'} />
			Organiser
		</button>
	</div>

	<div class="flex flex-col gap-3">
		{#each data.members.filter((m) => m.isValidedByUser) as member}
			<MemberCard {member} />
		{:else}
			<Placeholder class="gap-3 bg-base-300">
				<p>Tu n'es membre d'aucun évènement pour l'instant.</p>
				<a href="/" class="btn btn-ghost"> Trouver un évènement </a>
			</Placeholder>
		{/each}

		<div class="flex">
			<form method="POST" action="/me?/logout" class="contents">
				<button class="btn btn-sm">
					<Icon path={mdiLogout} size={20} class="opacity-70 rotate-180" />
					Déconnexion
				</button>
			</form>
		</div>
	</div>
</div>

<Dialog bind:dialog={createDialog}>
	<h2 slot="header" class="card-title">Nouvel évènement</h2>
	<EventForm on:cancel={() => createDialog.close()} on:success={() => createDialog.close()} />
</Dialog>

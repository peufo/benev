<script lang="ts">
	import type { Team, Member, User } from '@prisma/client'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputText, InputTextarea, DeleteButton, Dialog } from '$lib/material'
	import { eventPath } from '$lib/store'

	import InviteForm from '$lib/InviteForm.svelte'
	import InputMembers from '$lib/InputMembers.svelte'
	import { page } from '$app/stores'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let team:
		| (Team & {
				leaders: (Member & {
					user: User
				})[]
		  })
		| undefined = undefined

	const form = useForm({ successUpdate: false })

	let inviteDialog: HTMLDialogElement

	$: redirectTo =
		$page.url.searchParams.get('redirectTo') || `${$eventPath}/teams${team ? `/${team.id}` : ''}`
</script>

<form method="post" class="{klass} flex flex-col gap-2" use:enhance={form.submit}>
	{#if isUpdate}
		<h3 class="card-title">Modification du secteur</h3>
	{:else}
		<h3 class="card-title">Nouveau secteur</h3>
	{/if}

	<InputText key="name" label="Nom du secteur" value={team?.name} />

	<InputMembers key="leaders" label="Responsables" value={team?.leaders} {inviteDialog} />

	<InputTextarea key="description" label="Description" value={team?.description || ''} />

	<input type="hidden" name="redirectTo" value={$page.url.searchParams.get('redirectTo') || ''} />

	<div class="flex gap-2 flex-row-reverse">
		<button class="btn" formaction={isUpdate ? '?/update' : ''} type="submit"> Valider </button>
		{#if isUpdate}
			<DeleteButton formaction="?/delete" />
		{/if}
		<div class="grow" />
		<a class="btn btn-ghost" href={redirectTo}>Annuler</a>
	</div>
</form>

<Dialog bind:dialog={inviteDialog} title="Inviter un nouveau membre">
	<InviteForm on:success={() => inviteDialog.close()} />
</Dialog>

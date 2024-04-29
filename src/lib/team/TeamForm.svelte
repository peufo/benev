<script lang="ts">
	import type { Team, Member, User, Event, Field } from '@prisma/client'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'

	import { useForm } from '$lib/validation'
	import { InputText, InputTextarea, ButtonDelete, Dialog, InputDate } from 'fuma'
	import { eventPath } from '$lib/store'

	import InviteForm from '$lib/InviteForm.svelte'
	import InputMembers from '$lib/InputMembers.svelte'
	import { MemberConditions } from '$lib/member'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let event: Event & { memberFields: Field[] }
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

	{#if $page.data.member?.roles.includes('admin')}
		<InputMembers key="leaders" label="Responsables" value={team?.leaders} {inviteDialog} />
	{/if}
	<InputTextarea key="description" label="Description" value={team?.description || ''} />

	{#if event.selfSubscribeAllowed}
		<InputDate
			key="closeSubscribing"
			label="Fin des inscriptions"
			value={team?.closeSubscribing}
			hint={event.closeSubscribing && !team?.closeSubscribing
				? `Par défaut: ${event.closeSubscribing.toLocaleDateString()}`
				: ''}
		/>
	{/if}

	<MemberConditions conditions={team?.conditions || []} memberFields={event.memberFields} />

	<input type="hidden" name="redirectTo" value={$page.url.searchParams.get('redirectTo') || ''} />

	<div class="flex gap-2 flex-row-reverse mt-2">
		<button class="btn" formaction={isUpdate ? '?/update' : ''} type="submit"> Valider </button>
		{#if isUpdate && $page.data.member?.roles.includes('admin')}
			<ButtonDelete formaction="?/delete" />
		{/if}
		<div class="grow" />
		<a class="btn btn-ghost" href={redirectTo}>Annuler</a>
	</div>
</form>

<Dialog bind:dialog={inviteDialog}>
	<h2 slot="header" class="card-title">Inviter un nouveau membre</h2>
	<InviteForm on:success={() => inviteDialog.close()} />
</Dialog>

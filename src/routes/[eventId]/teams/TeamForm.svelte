<script lang="ts">
	import type { Team, Member, User } from '@prisma/client'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { api } from '$lib/api'
	import {
		InputRelations,
		InputText,
		InputTextarea,
		DeleteButton,
		Icon,
		Dialog,
	} from '$lib/material'
	import { eventPath } from '$lib/store'
	import { mdiAccountPlusOutline, mdiClose } from '@mdi/js'
	import InviteForm from '$lib/InviteForm.svelte'

	let klass = ''
	export { klass as class }
	export let isUpdate = false
	export let team: (Team & { leaders: (Member & { user: User })[] }) | undefined = undefined

	const form = useForm({ successUpdate: false })

	let inviteDialog: HTMLDialogElement
</script>

<form method="post" class="{klass} flex flex-col gap-2" use:enhance={form.submit}>
	{#if isUpdate}
		<h3 class="font-bold text-lg">Modification du secteur</h3>
	{:else}
		<h3 class="font-bold text-lg">Nouveau secteur</h3>
	{/if}

	<InputText key="name" label="Nom du secteur" value={team?.name} />
	<InputRelations
		key="leaders"
		label="Responsables"
		placeholder="Chercher un membre"
		getItems={$api.member.findMany}
		search={$api.member.search}
		value={team?.leaders}
	>
		<!-- Good type -->
		<span slot="badge" let:item>
			{item.user.firstName}
			{item.user.lastName}
		</span>

		<!-- Bad type (any) -->
		<div slot="listItem" let:item class="flex w-full">
			<span>{item.user.firstName} {item.user.lastName}</span>
			<div class="grow" />
			<span style="font-size: 0.6rem;">{item.user.email}</span>
		</div>

		<div slot="append">
			<button type="button" class="btn btn-square" on:click={() => inviteDialog.showModal()}>
				<Icon path={mdiAccountPlusOutline} title="Inviter un nouveau membre" />
			</button>
		</div>
	</InputRelations>
	<InputTextarea key="description" label="Description" value={team?.description || ''} />

	<div class="flex gap-2 flex-row-reverse">
		<button class="btn" formaction={isUpdate ? '?/update' : ''} type="submit"> Valider </button>
		{#if isUpdate}
			<DeleteButton formaction="?/delete" />
		{/if}
		<div class="grow" />
		<a class="btn btn-ghost" href="{$eventPath}/teams">Annuler</a>
	</div>
</form>

<Dialog bind:dialog={inviteDialog} title="Inviter un nouveau membre">
	<InviteForm on:success={() => inviteDialog.close()} />
</Dialog>

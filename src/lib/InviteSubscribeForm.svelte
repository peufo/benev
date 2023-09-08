<script lang="ts">
	import { Dialog } from '$lib/material'
	import { useForm } from '$lib/form'
	import { enhance } from '$app/forms'
	import InputMembers from '$lib/InputMembers.svelte'
	import InviteForm from '$lib/InviteForm.svelte'

	let newMemberDialog: HTMLDialogElement

	const form = useForm()
</script>

<form method="post" action="" use:enhance={form.submit} class="flex flex-col gap-2">
	<InputMembers key="members" inviteDialog={newMemberDialog} />

	<div class="flex justify-end">
		<button class="btn"> Inviter </button>
	</div>
</form>

<Dialog bind:dialog={newMemberDialog} title="Inviter un nouveau membre">
	<InviteForm on:success={() => newMemberDialog.close()} />
</Dialog>

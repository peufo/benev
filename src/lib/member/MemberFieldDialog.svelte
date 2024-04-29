<script lang="ts">
	import type { Field } from '@prisma/client'
	import { Dialog } from 'fuma'
	import { MemberFieldForm } from '$lib/member'
	import { createEventDispatcher } from 'svelte'

	export let successReset = true
	export let successUpdate = true

	let formDialog: HTMLDialogElement
	let memberFieldForm: MemberFieldForm
	let isUpdate = false

	export function open(field?: Field) {
		isUpdate = !!field
		memberFieldForm.setField(field || null)
		formDialog.showModal()
	}

	const dispatch = createEventDispatcher<{ success: Field | undefined }>()
</script>

<Dialog bind:dialog={formDialog}>
	<span slot="header" class="card-title">
		{isUpdate ? 'Modifier le' : 'Ajouter un'} champ
	</span>

	<MemberFieldForm
		{successReset}
		{successUpdate}
		on:success={({ detail }) => {
			formDialog.close()
			dispatch('success', detail)
		}}
		bind:this={memberFieldForm}
	/>
</Dialog>

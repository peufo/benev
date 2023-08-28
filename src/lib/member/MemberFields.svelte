<script lang="ts">
	import { slide } from 'svelte/transition'
	import { mdiClose } from '@mdi/js'
	import { Field } from '@prisma/client'
	import { Card, Icon } from '$lib/material'
	import { memberFieldType } from '$lib/form'
	import MemberFieldForm from './MemberFieldForm.svelte'
	import WorkInProgress from '$lib/WorkInProgress.svelte'

	export let fields: Field[]

	let formDialog: HTMLDialogElement
	let memberFieldForm: MemberFieldForm
	let isUpdate = false
	function handleClickNewField() {
		isUpdate = false
		memberFieldForm.setField(null)
		formDialog.showModal()
	}

	function handleClickUpdateField(field: Field) {
		isUpdate = true
		memberFieldForm.setField(field)
		formDialog.showModal()
	}
</script>

<Card>
	<span slot="title">
		<WorkInProgress>
			<span>Profil des membres</span>
		</WorkInProgress>
	</span>
	<span slot="subtitle">Informations complémentaires concernant vos membres</span>
	<div>
		{#each fields as field (field.id)}
			<button
				transition:slide
				on:click={() => handleClickUpdateField(field)}
				class="
					w-full mt-2 flex gap-3 p-3 items-center border border-neutral rounded-lg
					bg-base-200/50 hover:bg-base-200 cursor-pointer
				"
			>
				<Icon path={memberFieldType[field.type].icon} />
				{field.name}
			</button>
		{/each}
	</div>

	<button class="btn" on:click={handleClickNewField}> Ajouter un champ </button>
</Card>

<dialog bind:this={formDialog} class="modal">
	<div class="modal-box">
		<div class="flex items-center justify-between pb-4">
			<span class="card-title">
				{isUpdate ? 'Modifier le' : 'Ajouter un'} champ
			</span>
			<button class="btn btn-square btn-ghost btn-sm" on:click={() => formDialog.close()}>
				<Icon path={mdiClose} />
			</button>
		</div>
		<MemberFieldForm on:success={() => formDialog.close()} bind:this={memberFieldForm} />
	</div>
</dialog>

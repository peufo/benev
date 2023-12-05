<script lang="ts">
	import { slide } from 'svelte/transition'
	import { mdiDrag, mdiPlus } from '@mdi/js'
	import axios from 'axios'
	import type { Field } from '@prisma/client'
	import { listEditable } from '$lib/action'
	import { Dialog, Icon } from '$lib/material'
	import { memberFieldType } from '$lib/validation'
	import MemberFieldForm from './MemberFieldForm.svelte'
	import { eventPath } from '$lib/store'
	import { useNotify } from '$lib/notify'

	export let fields: Field[]
	const notify = useNotify()

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

	async function handleReorder(reorderedFields: Field[]) {
		fields = reorderedFields
		const form = new FormData()
		reorderedFields.forEach((field, index) => {
			form.append(field.id, String(index))
		})
		axios
			.postForm(`${$eventPath}/admin/config?/reorder_fields`, form)
			.then(() => notify.success('Nouvel ordre sauvegardé'))
			.catch((err) => notify.error(err))
	}
</script>

<div class="flex items-center mb-2">
	<h3 class="text-lg font-medium opacity-75 grow">Champs personalisés</h3>
	<button class="btn btn-square" on:click={handleClickNewField}>
		<Icon path={mdiPlus} title="Ajouter un champ" />
	</button>
</div>

<div
	use:listEditable={{
		dragElementsSelector: '.drag-button',
		items: fields,
		onChange: handleReorder,
	}}
	class="flex flex-col gap-2"
>
	{#each fields as field (field.id)}
		<button
			transition:slide
			on:click={() => handleClickUpdateField(field)}
			class="
				w-full flex gap-3 py-3 px-4 items-center border rounded-lg
				bg-base-200/50 hover:bg-base-200 cursor-pointer
			"
		>
			<Icon path={memberFieldType[field.type].icon} class="opacity-70" />
			<span>
				{field.name}
				{#if field.required && field.memberCanWrite}
					<sup>*</sup>
				{/if}
			</span>

			<span class="drag-button btn btn-sm btn-square btn-ghost ml-auto">
				<Icon path={mdiDrag} />
			</span>
		</button>
	{/each}
</div>

<Dialog bind:dialog={formDialog}>
	<span slot="header" class="card-title">
		{isUpdate ? 'Modifier le' : 'Ajouter un'} champ
	</span>

	<MemberFieldForm
		on:success={() => {
			formDialog.close()
		}}
		bind:this={memberFieldForm}
	/>
</Dialog>

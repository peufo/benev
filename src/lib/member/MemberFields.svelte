<script lang="ts">
	import { slide } from 'svelte/transition'
	import { mdiDrag, mdiPlus } from '@mdi/js'
	import axios from 'axios'
	import type { Field } from '@prisma/client'
	import { listEditable } from '$lib/action'
	import { Icon, Placeholder } from '$lib/material'
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import { MemberFieldDialog } from '$lib/member'
	import { eventPath } from '$lib/store'
	import { useNotify } from '$lib/notify'

	export let fields: Field[]
	const notify = useNotify()

	let memberFieldDialog: MemberFieldDialog

	async function handleReorder(reorderedFields: Field[]) {
		fields = reorderedFields
		const form = new FormData()
		reorderedFields.forEach((field, index) => {
			form.append(field.id, String(index))
		})
		axios
			.postForm(`${$eventPath}/admin/adhesion?/reorder_fields`, form)
			.then(() => notify.success('Nouvel ordre sauvegardé'))
			.catch((err) => notify.error(err))
	}
</script>

<div class="flex items-center mb-2">
	<h3 class="font-medium opacity-80 grow">Champs du profil de membre</h3>
	<button class="btn btn-square btn-sm" on:click={() => memberFieldDialog.open()}>
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
			on:click={() => memberFieldDialog.open(field)}
			class="
				w-full flex gap-3 py-3 px-4 items-center border rounded-lg
				bg-base-200/50 hover:bg-base-200 cursor-pointer
			"
		>
			<Icon path={MEMBER_FIELD_TYPE[field.type].icon} class="opacity-70" />
			<span>
				{field.name}
				{#if field.required && field.memberCanWrite}
					<span class="text-error text-lg">*</span>
				{/if}
			</span>

			<span class="drag-button btn btn-sm btn-square btn-ghost ml-auto">
				<Icon path={mdiDrag} />
			</span>
		</button>
	{/each}
</div>

{#if !fields.length}
	<Placeholder />
{/if}

<MemberFieldDialog bind:this={memberFieldDialog} />

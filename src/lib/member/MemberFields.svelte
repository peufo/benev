<script lang="ts">
	import { GripIcon, PlusIcon } from '@lucide/svelte'
	import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation'
	import { toast } from 'svelte-sonner'
	import type { Field } from '@prisma/client'
	import { Placeholder } from '$lib/fuma-legacy'
	import { listEditable, tip } from 'fuma'
	import { urlParam } from 'fuma'
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import { reorderMemberFields } from './memberField.remote'

	interface Props {
		fields: Field[]
	}

	let { fields = $bindable() }: Props = $props()

	async function handleReorder(reorderedFields: Field[]) {
		fields = reorderedFields
		try {
			await reorderMemberFields(reorderedFields.map(({ id }) => id))
			toast.success('Nouvel ordre sauvegardé')
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Réordonnancement impossible')
		}
	}
</script>

<div class="flex items-center mb-2">
	<h3 class="font-medium opacity-80 grow">Champs du profil de membre</h3>
	<a
		class="btn btn-square btn-sm btn-primary"
		href={urlParam.with({ form_field: '{}' })}
		data-sveltekit-replacestate
		data-sveltekit-noscroll
	>
		<span class="inline-flex" use:tip={{ content: 'Ajouter un champ' }}><PlusIcon /></span>
	</a>
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
		{@const FieldIcon = MEMBER_FIELD_TYPE[field.type].icon}
		<button
			transition:slide
			onclick={() =>
				goto(urlParam.with({ form_field: field.id }), { replaceState: true, noScroll: true })}
			class="
				w-full flex gap-3 py-3 px-4 items-center border rounded-lg
				bg-base-200/50 hover:bg-base-200 cursor-pointer
			"
		>
			<FieldIcon class="opacity-70" />
			<span>
				{field.name}
				{#if field.required && field.memberCanWrite}
					<span class="text-error text-lg">*</span>
				{/if}
			</span>

			<span class="drag-button btn btn-sm btn-square btn-ghost ml-auto">
				<GripIcon />
			</span>
		</button>
	{/each}
</div>

{#if !fields.length}
	<Placeholder />
{/if}

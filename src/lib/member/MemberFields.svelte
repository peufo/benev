<script lang="ts">
	import { MoveVerticalIcon } from '@lucide/svelte'
	import { slide } from 'svelte/transition'
	import { goto } from '$app/navigation'
	import { toast } from 'svelte-sonner'
	import type { Field } from '@prisma/client'
	import { Placeholder } from '$lib/ui'
	import { listEditable } from 'fuma'
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
		<!-- `type="button"` explicite: cette liste vit dans le grand `<form>` de `/admin/settings`,
		     où un bouton sans type soumettrait la page à chaque champ ouvert. -->
		<button
			type="button"
			transition:slide
			onclick={() =>
				goto(urlParam.with({ form_field: field.id }), { replaceState: true, noScroll: true })}
			class={[
				'w-full flex gap-3 py-3 px-4 items-center',
				'border border-hard rounded-field',
				'bg-base-200/50 hover:bg-base-200 cursor-pointer group',
			]}
		>
			<FieldIcon class="opacity-70" />
			<span>
				{field.name}
				{#if field.required && field.memberCanWrite}
					<span class="text-error text-lg">*</span>
				{/if}
			</span>

			<span
				class={[
					'drag-button btn btn-sm btn-square btn-ghost ml-auto',
					'opacity-0 group-hover:opacity-100',
				]}
			>
				<MoveVerticalIcon class="text-base-content/70" />
			</span>
		</button>
	{/each}
</div>

{#if !fields.length}
	<Placeholder />
{/if}

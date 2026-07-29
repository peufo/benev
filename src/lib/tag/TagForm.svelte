<script lang="ts">
	import type { Tag } from '@prisma/client'
	import { ButtonDelete, InputString } from 'fuma'
	import { toast } from 'svelte-sonner'
	import { createTag, deleteTag, updateTag } from './tag.remote'

	interface Props {
		tag?: Partial<Tag>
		oncreated?: (tag: Tag) => void
		onupdated?: () => void
		ondeleted?: () => void
	}

	let { tag = $bindable({}), oncreated, onupdated, ondeleted }: Props = $props()

	const colors = [
		'#6CBEED',
		'#D7F171',
		'#7FC29B',
		'#63D2FF',
		'#6741d9',
		'#9c36b5',
		'#c2255c',
		'#f08c02',
		'#e8580c',
		'#846358',
	]
	if (!tag.color) tag.color = colors[Math.round(Math.random() * (colors.length - 1))]

	const remoteForm = $derived(tag.id ? updateTag : createTag)
</script>

<form
	{...remoteForm.enhance(async ({ submit }) => {
		await submit()
		if (tag.id) {
			toast.success('Étiquette modifiée')
			onupdated?.()
		} else {
			toast.success('Étiquette crée')
			const created = createTag.result
			if (created) oncreated?.(created)
		}
	})}
	class="flex flex-col gap-4"
>
	{#if tag.id}
		<input type="hidden" name="id" value={tag.id} />
	{/if}

	<InputString
		field={remoteForm.fields.name}
		label="Nom"
		defaultValue={tag.name}
		autocomplete="off"
	/>
	<label class="form-control w-full max-w-xs">
		<div class="label">
			<span class="label-text">Couleur</span>
		</div>
		<input name="color" type="color" class="input w-full" value={tag.color} list="colors" />
		<datalist id="colors">
			{#each colors as color (color)}
				<option value={color}></option>
			{/each}
		</datalist>
	</label>

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>

{#if tag.id}
	<form
		{...deleteTag.enhance(async ({ submit }) => {
			await submit()
			toast.success('Étiquette supprimée')
			ondeleted?.()
		})}
		class="flex"
	>
		<input type="hidden" name="id" value={tag.id} />
		<ButtonDelete formaction={deleteTag.action}>Supprimer</ButtonDelete>
	</form>
{/if}

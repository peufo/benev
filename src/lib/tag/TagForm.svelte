<script lang="ts">
	import type { Tag } from '@prisma/client'
	import { ButtonDelete, InputString } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createTag, deleteTag, updateTag } from './tag.remote'

	interface Props {
		tag?: Partial<Tag>
		oncreated?: (tag: Tag) => void
		onupdated?: (tag: Tag) => void
		ondeleted?: (tagId: string) => void
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

	const uid = $props.id()
	const deleteFormId = `${uid}-delete`
	const remoteForm = $derived(tag.id ? updateTag.for(tag.id) : createTag.for(uid))
</script>

{#if tag.id}
	<!-- HTML interdit les <form> imbriqués: ce formulaire ne porte que les champs cachés, son
	bouton vit dans la barre d'actions du formulaire principal, associé par l'attribut `form`. -->
	<form
		{...deleteTag.enhance(
			enhanceForm({
				success: 'Étiquette supprimée',
				onsuccess: () => tag.id && ondeleted?.(tag.id),
			})
		)}
		id={deleteFormId}
		class="hidden"
	>
		<input type="hidden" name="id" value={tag.id} />
	</form>
{/if}

<form
	{...remoteForm.enhance(
		enhanceForm({
			success: tag.id ? 'Étiquette modifiée' : 'Étiquette crée',
			onsuccess: () => {
				// `result` porte l'étiquette telle qu'enregistrée: c'est elle que les formulaires
				// ouverts en dessous doivent afficher, la leur datant de leur propre chargement.
				const saved = remoteForm.result
				if (!saved) return
				if (tag.id) onupdated?.(saved)
				else oncreated?.(saved)
			},
		})
	)}
	class="flex flex-col gap-4"
>
	{#if tag.id}
		<input type="hidden" name="id" value={tag.id} />
	{/if}

	<InputString field={remoteForm.fields.name} label="Nom" value={tag.name} autocomplete="off" />
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
		{#if tag.id}
			<div class="grow"></div>
			<ButtonDelete form={deleteFormId} formaction={deleteTag.action} />
		{/if}
	</div>
</form>

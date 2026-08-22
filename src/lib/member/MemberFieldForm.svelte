<script lang="ts">
	import { slide } from 'svelte/transition'
	import { InputOptions } from '$lib/ui'
	import { ButtonDelete, InputBoolean, InputSelect, InputString } from 'fuma'
	import type { Field } from '@prisma/client'
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import { enhanceForm } from '$lib/enhanceForm'
	import { globalEvents } from '$lib/globalEvents'
	import { createMemberField, deleteMemberField, updateMemberField } from './memberField.remote'

	interface Props {
		field?: Partial<Field>
		onsuccess?: () => void
	}

	let { field = $bindable({}), onsuccess }: Props = $props()

	const uid = $props.id()
	const deleteFormId = `${uid}-delete`

	const remoteForm = $derived(
		field.id ? updateMemberField.for(field.id) : createMemberField.for(uid)
	)

	// `Object.entries` élargirait la clé en `string`: on la garde typée pour que la sélection
	// s'écrive sans cast.
	const fieldTypes = Object.keys(MEMBER_FIELD_TYPE).map((key) => {
		const type = key as Field['type']
		return { value: type, ...MEMBER_FIELD_TYPE[type] }
	})

	// `field` est un objet nu monté par le layout: y écrire ne déclenche aucun rendu. Le type
	// pilote l'affichage conditionnel, il lui faut donc son propre état — un dérivé assignable,
	// pour se ré-amorcer quand on passe d'un champ à l'autre.
	let type = $derived(field.type)

	// `value()` ne renvoie rien tant que la case n'a pas été touchée: le repli sur `field` donne
	// l'état de départ.
	let canWrite = $derived(remoteForm.fields.memberCanWrite.value() ?? field.memberCanWrite ?? false)
</script>

{#if field.id}
	<!-- HTML interdit les <form> imbriqués: ce formulaire ne porte que les champs cachés, son
	bouton vit dans la barre d'actions du formulaire principal, associé par l'attribut `form`. -->
	<form
		{...deleteMemberField.enhance(
			enhanceForm({ success: 'Champ supprimé', onsuccess: () => onsuccess?.() })
		)}
		id={deleteFormId}
		class="hidden"
	>
		<input type="hidden" name="id" value={field.id} />
	</form>
{/if}

<form
	{...remoteForm.enhance(
		enhanceForm({
			success: 'Succès',
			onsuccess: () => {
				const created = remoteForm.result
				if (!field.id && created) globalEvents.emit('field_created', created)
				onsuccess?.()
			},
		})
	)}
	class="flex flex-col gap-4"
>
	{#if field.id}
		<input type="hidden" name="id" value={field.id} />
	{/if}

	{#key field.id}
		<InputSelect
			field={remoteForm.fields.type}
			label="Type de champ"
			items={fieldTypes}
			value={fieldTypes.find((option) => option.value === type)}
			onSelect={(option) => (type = option?.value)}
			placeholder="Choisir un type"
			class="w-full"
		>
			{#snippet selected(option)}
				<span class="flex items-center gap-2">
					<option.icon size={18} class="opacity-70" />
					<span>{option.label}</span>
				</span>
			{/snippet}
			{#snippet proposal(option)}
				<option.icon size={18} class="opacity-70" />
				<span>{option.label}</span>
			{/snippet}
		</InputSelect>

		<InputString
			field={remoteForm.fields.name}
			label="Nom"
			placeholder="Taille de t-shirt"
			value={field.name}
			autocomplete="off"
		/>

		{#if type === 'select' || type === 'multiselect'}
			<div transition:slide>
				<!-- Sans `bind:`: `InputOptions` n'a rien à renvoyer, son champ caché porte la valeur
			     soumise. Et lier `undefined` à un `$bindable` pourvu d'une valeur par défaut lève
			     — l'erreur tuait l'effet de rendu, et le formulaire entier cessait de se
			     mettre à jour. -->
				<InputOptions key="options" value={field.options ?? '[]'} />
			</div>
		{/if}

		{#if type === 'multiselect'}
			<div transition:slide>
				<InputBoolean
					field={remoteForm.fields.allCombinations}
					checked={field.allCombinations ?? false}
					label="Compter par combinaisons"
					hint="Dans la synthèse, chaque combinaison de valeurs compte comme une réponse distincte."
				/>
			</div>
		{/if}

		<!-- Les deux droits sont couplés: modifier suppose lire. `set()` repilote l'autre case,
		     dont le champ est la source de vérité. -->
		<InputBoolean
			field={remoteForm.fields.memberCanRead}
			checked={field.memberCanRead ?? false}
			label="Visible par les membres"
			hint="Sinon, seuls les responsables voient la valeur."
			oninput={(e) => {
				if (!e.currentTarget.checked) {
					remoteForm.fields.memberCanWrite.set(false)
					remoteForm.fields.required.set(false)
				}
			}}
		/>
		<InputBoolean
			field={remoteForm.fields.memberCanWrite}
			checked={field.memberCanWrite ?? false}
			label="Modifiable par les membres"
			hint="Le membre renseigne la valeur depuis son profil."
			oninput={(e) => {
				if (e.currentTarget.checked) remoteForm.fields.memberCanRead.set(true)
				else remoteForm.fields.required.set(false)
			}}
		/>

		{#if type !== 'boolean' && type !== 'multiselect'}
			<div transition:slide={{ duration: 200 }}>
				<InputBoolean
					field={remoteForm.fields.required}
					checked={field.required ?? false}
					label="Valeur obligatoire"
					hint="Le profil du membre est signalé incomplet tant que la valeur est vide."
					oninput={(e) => {
						if (e.currentTarget.checked) {
							remoteForm.fields.memberCanRead.set(true)
							remoteForm.fields.memberCanWrite.set(true)
						}
					}}
				/>
			</div>
		{/if}

		{#if canWrite}
			<div transition:slide={{ duration: 200 }}>
				<InputString
					field={remoteForm.fields.label}
					label="Question du formulaire"
					placeholder="Quelle est ta taille de t-shirt ?"
					value={field.label ?? ''}
					autocomplete="off"
				/>
			</div>
		{/if}
	{/key}

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
		{#if field.id}
			<div class="grow"></div>
			<ButtonDelete form={deleteFormId} formaction={deleteMemberField.action} />
		{/if}
	</div>
</form>

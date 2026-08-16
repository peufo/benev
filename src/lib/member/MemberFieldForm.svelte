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

	const remoteForm = $derived(field.id ? updateMemberField : createMemberField)
	const deleteFormId = $props.id()

	// `Object.entries` élargirait la clé en `string`: on la garde typée pour que la sélection
	// s'écrive sans cast.
	const fieldTypes = Object.keys(MEMBER_FIELD_TYPE).map((key) => {
		const type = key as Field['type']
		return { value: type, ...MEMBER_FIELD_TYPE[type] }
	})

	// `field` est un objet nu monté par le layout: y écrire ne déclenche aucun rendu. Tout ce que
	// le formulaire repilote a donc son propre état — des dérivés assignables, pour se ré-amorcer
	// quand on passe d'un champ à l'autre.
	let type = $derived(field.type)
	let canRead = $derived(!!field.memberCanRead)
	let canWrite = $derived(!!field.memberCanWrite)

	function setMemberRight(right: 'read' | 'write', checked: boolean) {
		// Les deux droits sont couplés: modifier suppose lire.
		if (right === 'write') {
			canWrite = checked
			if (checked) canRead = true
		} else {
			canRead = checked
			if (!checked) canWrite = false
		}
	}
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
				const created = createMemberField.result
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

		<InputString field={remoteForm.fields.name} label="Nom" value={field.name} autocomplete="off" />
		<InputString
			field={remoteForm.fields.label}
			label="Label"
			value={field.label ?? ''}
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
					label="Compter par combinaisons de valeurs lors de la syhtèse"
				/>
				<!-- TODO: Add help dialog -->
			</div>
		{/if}

		<!-- Les deux cases n'ont pas de `name`: leur résultat part par les champs cachés
		     ci-dessous, que `as('hidden', …)` préfixe de `b:` pour que SvelteKit les relise en
		     booléens. -->
		<fieldset class="fieldset">
			<legend class="label">Les membres peuvent</legend>
			<div class="flex gap-6">
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						class="checkbox"
						checked={canRead}
						oninput={(e) => setMemberRight('read', e.currentTarget.checked)}
					/>
					<span>Lire la valeur</span>
				</label>
				<label class="flex items-center gap-2">
					<input
						type="checkbox"
						class="checkbox"
						checked={canWrite}
						oninput={(e) => setMemberRight('write', e.currentTarget.checked)}
					/>
					<span>Modifier la valeur</span>
				</label>
			</div>
		</fieldset>

		<input {...remoteForm.fields.memberCanRead.as('hidden', canRead)} />
		<input {...remoteForm.fields.memberCanWrite.as('hidden', canWrite)} />

		{#if canWrite && type !== 'boolean' && type !== 'multiselect'}
			<div transition:slide={{ duration: 200 }}>
				<InputBoolean
					field={remoteForm.fields.required}
					checked={field.required ?? false}
					label="Les membres doivent renseigner la valeur"
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

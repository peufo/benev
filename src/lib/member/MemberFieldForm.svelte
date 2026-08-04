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

	// `Object.entries` élargirait la clé en `string`: on la garde typée pour que la sélection
	// s'écrive sans cast.
	const fieldTypes = Object.keys(MEMBER_FIELD_TYPE).map((key) => {
		const type = key as Field['type']
		return { value: type, ...MEMBER_FIELD_TYPE[type] }
	})

	// Sur un nouveau champ, `field` est un objet nu monté par le layout: y écrire ne déclenche
	// aucun rendu. Le type pilote l'affichage conditionnel et la valeur soumise, il lui faut
	// donc son propre état — dérivé assignable, pour suivre `field` d'un champ à l'autre.
	let type = $derived(field.type)

	function getMemberRight(value: Partial<Field>): string[] {
		return [value.memberCanRead && 'read', value.memberCanWrite && 'write'].filter(
			Boolean
		) as string[]
	}

	function handleInputMemberRight(event: Event) {
		const { value, checked } = event.target as HTMLInputElement
		if (value === 'write') {
			field.memberCanWrite = checked
			if (checked) field.memberCanRead = true
		} else if (value === 'read') {
			field.memberCanRead = checked
			if (!checked) field.memberCanWrite = false
		}
	}
</script>

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
		<!-- `type` reste aussi en état local: l'affichage conditionnel ci-dessous s'y accroche. -->
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
				<InputOptions key="options" bind:value={field.options} />
			</div>
		{/if}

		{#if type === 'multiselect'}
			<div transition:slide>
				<InputBoolean
					field={remoteForm.fields.allCombinations}
					checked={field.allCombinations ?? false}
					defaultChecked={field.allCombinations ?? false}
					label="Compter par combinaisons de valeurs lors de la syhtèse"
				/>
				<!-- TODO: Add help dialog -->
			</div>
		{/if}

		<!-- `InputCheckboxs` de fuma 1 laissait tomber le gestionnaire `oninput` (il partait sur
		     `FormControl`, qui ne le déclare pas): les deux cases n'étaient donc jamais couplées.
		     Elles sont écrites ici en clair, sans nom: seuls les champs cachés sont soumis. -->
		<div>
			<div class="label"><span class="label-text">Les membres peuvent</span></div>
			<div class="flex gap-6">
				{#each [{ value: 'read', label: 'Lire la valeur' }, { value: 'write', label: 'Modifier la valeur' }] as option (option.value)}
					<label class="flex items-center gap-2">
						<input
							type="checkbox"
							class="checkbox"
							value={option.value}
							checked={getMemberRight(field).includes(option.value)}
							oninput={handleInputMemberRight}
						/>
						<span>{option.label}</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Les deux cases ci-dessus sont couplées: leur résultat part par ces champs cachés,
		     que `as('hidden', …)` préfixe de `b:` pour que SvelteKit les relise en booléens. -->
		<input {...remoteForm.fields.memberCanRead.as('hidden', !!field.memberCanRead)} />
		<input {...remoteForm.fields.memberCanWrite.as('hidden', !!field.memberCanWrite)} />

		{#if field.memberCanWrite && type !== 'boolean' && type !== 'multiselect'}
			<div transition:slide={{ duration: 200 }}>
				<InputBoolean
					field={remoteForm.fields.required}
					checked={field.required ?? false}
					defaultChecked={field.required ?? false}
					label="Les membres doivent renseigner la valeur"
				/>
			</div>
		{/if}
	{/key}

	<div class="flex flex-row-reverse gap-2 border-t pt-4">
		<button class="btn btn-primary">Valider</button>
	</div>
</form>

{#if field.id}
	<form
		{...deleteMemberField.enhance(
			enhanceForm({ success: 'Champ supprimé', onsuccess: () => onsuccess?.() })
		)}
		class="flex"
	>
		<input type="hidden" name="id" value={field.id} />
		<ButtonDelete formaction={deleteMemberField.action}>Supprimer</ButtonDelete>
	</form>
{/if}

<script lang="ts">
	import { slide } from 'svelte/transition'
	import { InputOptions } from '$lib/ui'
	import { InputSelect } from '$lib/fuma-legacy'
	import { ButtonDelete, InputBoolean, InputString } from 'fuma'
	import type { Field } from '@prisma/client'
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import { toast } from 'svelte-sonner'
	import { globalEvents } from '$lib/globalEvents'
	import { createMemberField, deleteMemberField, updateMemberField } from './memberField.remote'

	interface Props {
		field?: Partial<Field>
		onsuccess?: () => void
	}

	let { field = $bindable({}), onsuccess }: Props = $props()

	const remoteForm = $derived(field.id ? updateMemberField : createMemberField)

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
	{...remoteForm.enhance(async ({ submit }) => {
		await submit()
		toast.success('Succès')
		const created = createMemberField.result
		if (!field.id && created) globalEvents.emit('field_created', created)
		onsuccess?.()
	})}
	class="flex flex-col gap-4"
>
	{#if field.id}
		<input type="hidden" name="id" value={field.id} />
	{/if}

	{#key field.id}
		<!-- `InputSelect` de fuma 1 reste ici: ses options portent des icônes `@mdi`, là où
		     `Option.icon` de fuma 2 attend un composant Lucide. Il transmet une chaîne simple. -->
		<InputSelect
			key="type"
			enhanceDisabled
			bind:value={field.type}
			options={MEMBER_FIELD_TYPE}
			label="Type de champ"
			class="w-full justify-start mt-4"
		/>

		<InputString field={remoteForm.fields.name} label="Nom" value={field.name} autocomplete="off" />
		<InputString
			field={remoteForm.fields.label}
			label="Label"
			value={field.label ?? ''}
			autocomplete="off"
		/>

		{#if field.type === 'select' || field.type === 'multiselect'}
			<div transition:slide>
				<InputOptions key="options" bind:value={field.options} />
			</div>
		{/if}

		{#if field.type === 'multiselect'}
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

		{#if field.memberCanWrite && field.type !== 'boolean' && field.type !== 'multiselect'}
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
		{...deleteMemberField.enhance(async ({ submit }) => {
			await submit()
			toast.success('Champ supprimé')
			onsuccess?.()
		})}
		class="flex"
	>
		<input type="hidden" name="id" value={field.id} />
		<ButtonDelete formaction={deleteMemberField.action}>Supprimer</ButtonDelete>
	</form>
{/if}

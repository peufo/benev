<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { slide } from 'svelte/transition'
	import type { Field } from '@prisma/client'
	import { enhance } from '$app/forms'
	import {
		useForm,
		InputSelect,
		InputText,
		InputBoolean,
		InputCheckboxs,
		ButtonDelete,
		InputOptions,
	} from 'fuma'
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import { MemberField } from '$lib/member'
	import { eventPath } from '$lib/store'

	export let successReset = true
	export let successUpdate = true

	const action = `${$eventPath}/admin/adhesion`

	const dispatch = createEventDispatcher<{ success: Field | undefined }>()
	const form = useForm<Field>({
		successReset,
		successUpdate,
		onSuccess: (url, field) => {
			dispatch('success', field)
			setField(null)
		},
	})

	type NonNull<T> = { [P in keyof T]-?: NonNullable<T[P]> }
	type FieldForm = { id?: string } & NonNull<
		Pick<
			Field,
			| 'type'
			| 'name'
			| 'label'
			| 'options'
			| 'memberCanRead'
			| 'memberCanWrite'
			| 'allCombinations'
			| 'required'
		>
	>
	export function setField(value: Field | null) {
		if (value === null) {
			field = { ...defaultField }
			return
		}
		field = {
			...value,
			label: value.label || '',
			options: value.options || '[]',
		}
	}

	const defaultField: FieldForm = {
		type: 'string',
		name: '',
		label: '',
		options: '[]',
		allCombinations: false,
		memberCanRead: true,
		memberCanWrite: true,
		required: true,
	}
	let field: FieldForm = { ...defaultField }

	function getMemberRight(value: FieldForm): string[] {
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

<form method="post" use:enhance={form.submit} class="flex flex-col gap-2">
	{#if field.id}
		<input type="hidden" name="id" value={field.id} />
	{/if}
	{#key field.id}
		<InputSelect
			key="type"
			bind:value={field.type}
			options={MEMBER_FIELD_TYPE}
			class="w-full justify-start"
		/>

		<InputText
			key="name"
			bind:value={field.name}
			label="Nom"
			hint="Le nom de la valeur"
			input={{ autocomplete: 'off' }}
		/>
		<InputText
			key="label"
			bind:value={field.label}
			label="Label"
			hint="Titre libre du champ, peut être sous forme de question"
			input={{ autocomplete: 'off' }}
		/>

		{#if field.type === 'select' || field.type === 'multiselect'}
			<div transition:slide>
				<InputOptions key="options" bind:value={field.options} />
			</div>
		{/if}

		{#if field.type === 'multiselect'}
			<div transition:slide>
				<InputBoolean
					value={field.allCombinations}
					key="allCombinations"
					label="Compter par combinaisons de valeurs lors de la syhtèse"
				/>
				<!-- TODO: Add help dialog -->
			</div>
		{/if}

		<InputCheckboxs
			value={getMemberRight(field)}
			on:input={handleInputMemberRight}
			label="Les membres peuvent"
			checkboxesClass="flex gap-6"
			options={[
				{ value: 'read', label: 'Lire la valeur' },
				{ value: 'write', label: 'Modifier la valeur' },
			]}
		/>

		<input type="hidden" name="memberCanRead" value={field.memberCanRead ? 'true' : ''} />
		<input type="hidden" name="memberCanWrite" value={field.memberCanWrite ? 'true' : ''} />

		{#if field.memberCanWrite && field.type !== 'boolean' && field.type !== 'multiselect'}
			<div transition:slide={{ duration: 200 }}>
				<div class="label">
					<span class="label-text">Les membres doivent</span>
				</div>

				<InputBoolean key="required" value={field.required} label="Renseigner la valeur" />
			</div>
		{/if}

		<h2 class="font-bold">Aperçu</h2>
		<div class="rounded-box border border-neutral p-2 bg-base-200">
			<MemberField {field} />
		</div>
	{/key}

	<div class="flex gap-2 flex-row-reverse">
		<button
			class="btn"
			formaction="{action}{field.id ? '?/update_field' : '?/create_field'}"
			type="submit"
		>
			Valider
		</button>
		{#if field.id}
			<ButtonDelete formaction="{action}?/delete_field" />
		{/if}
	</div>
</form>

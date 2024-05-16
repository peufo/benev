<script lang="ts">
	import { type ComponentType } from 'svelte'
	import { slide } from 'svelte/transition'
	import {
		InputSelect,
		InputText,
		InputBoolean,
		InputCheckboxs,
		InputOptions,
		USE_COERCE_BOOLEAN,
		Form,
	} from 'fuma'
	import type { Field } from '@prisma/client'
	import { MEMBER_FIELD_TYPE } from '$lib/constant'
	import { eventPath } from '$lib/store'
	import { modelMemberFieldCreate } from '$lib/models'
	import { globalEvents } from '$lib/globalEvents'

	const FormMemberField: ComponentType<Form<typeof modelMemberFieldCreate, Field>> = Form

	export let field: Partial<Field> = {}

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

<FormMemberField
	model={modelMemberFieldCreate}
	action="{$eventPath}/admin/adhesion?/field"
	on:success
	on:created={({ detail }) => globalEvents.emit('field_created', detail)}
	data={field}
>
	{#key field.id}
		<InputSelect
			key="type"
			bind:value={field.type}
			options={MEMBER_FIELD_TYPE}
			label="Type de champ"
			class="w-full justify-start mt-4"
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

		<input
			type="hidden"
			name="memberCanRead"
			value="{USE_COERCE_BOOLEAN}{field.memberCanRead ? 'true' : ''}"
		/>
		<input
			type="hidden"
			name="memberCanWrite"
			value="{USE_COERCE_BOOLEAN}{field.memberCanWrite ? 'true' : ''}"
		/>

		{#if field.memberCanWrite && field.type !== 'boolean' && field.type !== 'multiselect'}
			<div transition:slide={{ duration: 200 }}>
				<div class="label">
					<span class="label-text">Les membres doivent</span>
				</div>

				<InputBoolean
					key="required"
					value={field.required}
					label="Renseigner la valeur"
					labelPosition="right"
				/>
			</div>
		{/if}
	{/key}
</FormMemberField>

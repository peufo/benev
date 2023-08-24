<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { slide } from 'svelte/transition'
	import { FieldType } from '@prisma/client'
	import { enhance } from '$app/forms'
	import { memberFieldType, useForm } from '$lib/form'
	import { InputSelect, InputText, InputCheckboxs, DeleteButton, InputOptions } from '$lib/material'
	import MemberField from './MemberField.svelte'

	export let isUpdate = false

	const dispatch = createEventDispatcher<{ success: void }>()
	const form = useForm({
		successCallback: () => dispatch('success'),
	})

	let memberRight: string[] = ['read', 'write']
	let fieldType: FieldType = 'string'
	let name = ''
	let label = ''
	let options = '[]'

	$: memberCanRead = memberRight.includes('read')
	$: memberCanWrite = memberRight.includes('write')

	function handleInputMemberRight(event: Event) {
		const { value, checked } = event.target as HTMLInputElement
		if (value === 'write' && checked) memberRight = ['read', 'write']
		else if (value === 'read' && !checked) memberRight = []
	}
</script>

<form method="post" use:enhance={form.submit} class="flex flex-col gap-2">
	<InputSelect key="type" bind:value={fieldType} options={memberFieldType} />

	<InputText
		key="name"
		bind:value={name}
		label="Nom"
		hint="Le nom de la valeur"
		input={{ autocomplete: 'off' }}
	/>
	<InputText
		key="label"
		bind:value={label}
		label="Label"
		hint="Titre libre du champ, peut être sous forme de question"
		input={{ autocomplete: 'off' }}
	/>

	{#if fieldType === 'select' || fieldType === 'multiselect'}
		<div transition:slide>
			<InputOptions key="options" bind:value={options} />
		</div>
	{/if}

	<InputCheckboxs
		bind:value={memberRight}
		on:input={handleInputMemberRight}
		label="Les membres peuvent"
		checkboxesClass="flex gap-6"
		options={[
			{ value: 'read', label: 'Lire la valeur' },
			{ value: 'write', label: 'Modifier la valeur' },
		]}
	/>

	<input type="hidden" name="boolean_memberCanRead" value={memberCanRead} />
	<input type="hidden" name="boolean_memberCanWrite" value={memberCanWrite} />

	<h2 class="font-bold">Aperçu</h2>
	<div class="rounded-box border bordered p-2 bg-base-200">
		<MemberField
			field={{
				type: fieldType,
				name: '',
				label: label || name,
				memberCanRead,
				memberCanWrite,
				options,
			}}
		/>
	</div>

	<div class="flex gap-2 flex-row-reverse">
		<button class="btn" formaction={isUpdate ? '?/update_field' : '?/create_field'} type="submit">
			Valider
		</button>
		{#if isUpdate}
			<DeleteButton formaction="?/delete_field" />
		{/if}
	</div>
</form>

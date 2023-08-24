<script lang="ts">
	import { enhance } from '$app/forms'
	import { FieldType } from '@prisma/client'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import { memberFieldType, useForm } from '$lib/form'
	import { InputSelect, InputText, InputCheckboxs } from '$lib/material'
	import MemberField from './MemberField.svelte'
	import { slide } from 'svelte/transition'
	import InputOptions from '$lib/material/input/InputOptions.svelte'

	const form = useForm()
	let memberRight: string[] = []

	let fieldType: FieldType = 'multiselect'
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

<WorkInProgress />

<form method="post" use:enhance={form.submit}>
	<InputSelect key="type" bind:value={fieldType} options={memberFieldType} />

	<InputText key="name" bind:value={name} label="Nom" hint="Le nom de la valeur" />
	<InputText
		key="label"
		bind:value={label}
		label="Label"
		hint="Titre libre du champ, peut être sous forme de question"
	/>

	{#if fieldType === 'select' || fieldType === 'multiselect'}
		<div transition:slide>
			<InputOptions key="options" bind:value={options} />
		</div>
	{/if}

	<InputCheckboxs
		bind:value={memberRight}
		on:input={handleInputMemberRight}
		key="memberRight"
		label="Le membre peut"
		checkboxesClass="flex gap-6"
		options={[
			{ value: 'read', label: 'Lire la valeur' },
			{ value: 'write', label: 'Modifier la valeur' },
		]}
	/>

	<input type="hidden" name="memberCanRead" value={memberCanRead} />
	<input type="hidden" name="memberCanWrite" value={memberCanWrite} />
</form>

<h2 class="font-bold">Aperçu</h2>
<div class="rounded-box border bordered p-2 bg-base-200">
	<MemberField field={{ type: fieldType, name, label, memberCanRead, memberCanWrite, options }} />
</div>

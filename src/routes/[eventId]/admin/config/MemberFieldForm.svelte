<script lang="ts">
	import { enhance } from '$app/forms'
	import WorkInProgress from '$lib/WorkInProgress.svelte'
	import { memberFieldType, useForm } from '$lib/form'
	import { InputSelect, InputText } from '$lib/material'
	import InputCheckboxs from '$lib/material/input/InputCheckboxs.svelte'

	const form = useForm()
	let memberRight: string[] = []

	function handleInputMemberRight(event: Event) {
		const { value, checked } = event.target as HTMLInputElement
		if (value === 'write' && checked) memberRight = ['read', 'write']
		else if (value === 'read' && !checked) memberRight = []
	}
</script>

<WorkInProgress />

<form method="post" use:enhance={form.submit}>
	<InputSelect key="type" value="string" options={memberFieldType} />

	<InputText key="name" label="Nom" hint="Le nom de la donnée récoltée." />
	<InputText key="label" label="Label" hint="Titre libre, peut être sous forme de question." />

	<!--
		<InputBoolean key="required" label="Champ requis" />
	-->

	<InputCheckboxs
		bind:value={memberRight}
		on:input={handleInputMemberRight}
		key="memberRight"
		label="Le membre peut"
		options={[
			{ value: 'read', label: 'Lire la valeur' },
			{ value: 'write', label: 'Modifier la valeur' },
		]}
	/>
	<input
		type="hidden"
		name="memberCanRead"
		value={memberRight.includes('read') ? 'true' : 'false'}
	/>
	<input
		type="hidden"
		name="memberCanWrite"
		value={memberRight.includes('write') ? 'true' : 'false'}
	/>

</form>

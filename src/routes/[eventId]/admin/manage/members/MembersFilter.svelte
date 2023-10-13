<script lang="ts">
	import { Field } from '@prisma/client'
	import PeriodPickerButton from '$lib/period/PeriodPickerButton.svelte'
	import { InputCheckboxsMenu, InputOptionInParam } from '$lib/material'
	import FieldsFilter from '$lib/FieldsFilter.svelte'

	export let teams: { id: string; name: string }[]
	export let fields: Field[]
</script>

<PeriodPickerButton />

<InputCheckboxsMenu
	key="teams"
	label="secteurs"
	options={teams.map((t) => ({ value: t.id, label: t.name }))}
	enhanceDisabled
	badgePrimary
/>

<InputOptionInParam
	key="memberType"
	options={{
		volunteers: 'Bénévoles',
		leaders: 'Responsables',
	}}
/>

<FieldsFilter {fields} />

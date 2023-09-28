<script lang="ts">
	import { Field } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import PeriodPickerButton from '$lib/period/PeriodPickerButton.svelte'
	import { InputCheckboxsMenu, InputRadioButtons } from '$lib/material'
	import FieldsFilter from './FieldsFilter.svelte'

	export let teams: { id: string; name: string }[]
	export let fields: Field[]
</script>

<PeriodPickerButton action="{$eventPath}/admin" />

<InputCheckboxsMenu
	key="teams"
	label="secteurs"
	options={teams.map((t) => ({ value: t.id, label: t.name }))}
	enhanceDisabled
	badgePrimary
/>

<InputRadioButtons
	key="member_type"
	options={{
		volunteers: 'Bénévoles',
		leaders: 'Responsables',
	}}
	bindWithParams
/>

<FieldsFilter {fields} />

<script lang="ts">
	import { Field } from '@prisma/client'
	import { mdiAccountCircleOutline, mdiShieldAccount } from '@mdi/js'

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
		leaders: { label: 'Responsables (au moins un secteur à charge)', icon: mdiShieldAccount },
		volunteers: { label: 'Bénévoles (au moins une inscription)', icon: mdiAccountCircleOutline },
	}}
/>

<FieldsFilter {fields} />

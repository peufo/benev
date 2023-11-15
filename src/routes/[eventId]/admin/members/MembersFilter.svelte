<script lang="ts">
	import type { Field } from '@prisma/client'
	import { mdiAccountCircleOutline, mdiShieldAccountOutline, mdiStarOutline } from '@mdi/js'

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
	key="role"
	options={{
		admin: {
			icon: mdiStarOutline,
			label: 'Administrateurs',
		},
		leader: {
			icon: mdiShieldAccountOutline,
			label: 'Responsables (au moins un secteur à charge)',
		},
		member: {
			icon: mdiAccountCircleOutline,
			label: 'Bénévoles (au moins une inscription)',
		},
	}}
/>

<FieldsFilter {fields} />

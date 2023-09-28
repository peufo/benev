<script lang="ts">
	import type { Field, Team } from '@prisma/client'
	import { InputCheckboxsMenu } from '$lib/material'
	import { PeriodPickerButton } from '$lib/period'
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

<FieldsFilter {fields} />

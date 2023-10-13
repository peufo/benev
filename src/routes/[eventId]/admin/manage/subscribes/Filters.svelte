<script lang="ts">
	import { InputCheckboxsMenu } from '$lib/material'
	import { PeriodPickerButton } from '$lib/period'
	import { subscribeStateLabel } from '$lib/form'
	// import FieldsFilter from '$lib/FieldsFilter.svelte'

	export let teams: { id: string; name: string }[]
	// export let fields: Field[]
</script>

<PeriodPickerButton />

<InputCheckboxsMenu
	key="teams"
	label="secteurs"
	options={teams.map((t) => ({ value: t.id, label: t.name }))}
	enhanceDisabled
	badgePrimary
/>

<InputCheckboxsMenu
	key="states"
	label="Statuts"
	options={subscribeStateLabel}
	enhanceDisabled
	badgePrimary
/>

<!-- TODO: mise en place des customs fields sur les subscribes ?
	<FieldsFilter {fields} />
-->

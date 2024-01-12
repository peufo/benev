<script lang="ts">
	import { InputCheckboxsMenu } from '$lib/material'
	import { PeriodPickerButton } from '$lib/period'
	import { SUBSCRIBE_STATE } from '$lib/constant'

	export let teams: { id: string; name: string }[]
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
	options={SUBSCRIBE_STATE}
	enhanceDisabled
	badgePrimary
/>

<!-- TODO: mise en place des customs fields sur les subscribes ?
	<FieldsFilter {fields} />
-->

<script lang="ts">
	import { InputCheckboxsMenu } from '$lib/material'
	import { PeriodPickerButton } from '$lib/period'
	import { subscribeStateLabel } from '$lib/validation'
	import InputOptionInParam from '$lib/material/input/InputOptionInParam.svelte'
	import { mdiAccountCircleOutline, mdiShieldAccountOutline } from '@mdi/js'

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

<InputOptionInParam
	key="createdBy"
	options={{
		leader: { label: 'Inscrit par un responsable', icon: mdiShieldAccountOutline },
		user: { label: 'Inscrit par le membre', icon: mdiAccountCircleOutline },
	}}
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

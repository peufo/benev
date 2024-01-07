<script lang="ts">
	import { InputCheckboxsMenu } from '$lib/material'
	import { PeriodPickerButton } from '$lib/period'
	import { SUBSCRIBE_STATE } from '$lib/constant'
	import InputOptionInParam from '$lib/material/input/InputOptionInParam.svelte'
	import {
		mdiAccountCircleOutline,
		mdiAlertOutline,
		mdiCheckCircleOutline,
		mdiShieldAccountOutline,
	} from '@mdi/js'

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

<InputOptionInParam
	key="isAbsent"
	options={{
		false: { label: 'Marqué comme présent', icon: mdiCheckCircleOutline },
		true: { label: 'Marqué comme absent', icon: mdiAlertOutline },
	}}
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

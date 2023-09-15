<script lang="ts">
	import { eventPath } from '$lib/store'
	import PeriodPickerButton from '$lib/period/PeriodPickerButton.svelte'
	import { InputCheckboxsMenu, InputRadioButtons } from '$lib/material'

	export let teams: { id: string; name: string }[]
</script>

<PeriodPickerButton action="{$eventPath}/admin" />
<InputCheckboxsMenu
	key="teams"
	label="Tous les secteurs"
	labelPlurial="Secteurs sélectionés"
	options={teams.map((t) => ({ value: t.id, label: t.name }))}
	enhanceDisabled
/>

<InputRadioButtons
	key="member_type"
	options={{
		volunteers: 'Bénévoles',
		leaders: 'Responsables',
		all: 'Tous',
	}}
	bindWithParams
/>

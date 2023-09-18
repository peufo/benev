<script lang="ts">
	import { mdiFilterOutline } from '@mdi/js'
	import { Field } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import PeriodPickerButton from '$lib/period/PeriodPickerButton.svelte'
	import { DropDown, Icon, InputCheckboxsMenu, InputRadioButtons, InputSelect } from '$lib/material'

	export let teams: { id: string; name: string }[]
	export let fields: Field[]

	let fieldFilter = ''
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

<div class="join">
	<InputSelect
		bind:value={fieldFilter}
		options={fields.map((f) => ({ value: f.id, label: f.label || f.name }))}
		class="join-item"
		btnClass="btn-sm"
	>
		<div class="contents" slot="placeholder">
			<Icon path={mdiFilterOutline} class="opacity-70 fill-base-content scale-90" />
			filtre
		</div>
	</InputSelect>

	{#if fieldFilter}
		<InputSelect options={['asda', 'asdasd', 'sdasssa']} btnClass="btn-sm join-item">
			<div class="contents" slot="placeholder">valeur</div>
		</InputSelect>
	{/if}
</div>

<Icon
	path={mdiFilterOutline}
	title=" ausndas dioasujas kiuhdasiuhasdijuhasi oasdiuhsadiuadshiuasdh asdiuh aswdi uh"
/>

<DropDown>asdasdasdasd asdasd</DropDown>

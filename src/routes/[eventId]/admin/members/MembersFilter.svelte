<script lang="ts">
	import { slide } from 'svelte/transition'
	import type { Field } from '@prisma/client'
	import {
		mdiAccountCircleOutline,
		mdiAlertOutline,
		mdiCheckCircleOutline,
		mdiShieldAccountOutline,
		mdiStarOutline,
	} from '@mdi/js'

	import { urlParam } from '$lib/store'
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

{#if $urlParam.hasValue('role', 'member')}
	<div transition:slide={{ axis: 'x' }}>
		<InputOptionInParam
			key="isAbsent"
			options={{
				false: { label: 'Présent à toutes ses périodes', icon: mdiCheckCircleOutline },
				true: { label: 'Absent à une période ou plus', icon: mdiAlertOutline },
			}}
		/>
	</div>
{/if}

<FieldsFilter {fields} />

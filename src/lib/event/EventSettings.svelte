<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Event as TEvent } from '@prisma/client'
	import { InputCheckboxs } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'

	const form = useForm()

	// TODO: implement setting in figma
	type Settings = {
		membersCanReadTeams: boolean
		membersCanReadPeriods: boolean
		membersCanSubscribe: boolean
	}
	export let event: Settings = {
		membersCanReadTeams: true,
		membersCanReadPeriods: true,
		membersCanSubscribe: true,
	}

	function getMemberRight(_event: Settings): string[] {
		return [
			event.membersCanReadTeams && 'membersCanReadTeams',
			event.membersCanReadPeriods && 'membersCanReadPeriods',
			event.membersCanSubscribe && 'membersCanSubscribe',
		].filter(Boolean) as string[]
	}

	function handleInputMemberRight({ target }: Event) {
		const { value, checked } = target as HTMLInputElement
		if (checked) {
			event.membersCanReadTeams = true
			if (value === 'membersCanReadTeams') return
			event.membersCanReadPeriods = true
			if (value === 'membersCanReadPeriods') return
			event.membersCanSubscribe = true
			return
		}
		event.membersCanSubscribe = false
		if (value === 'membersCanSubscribe') return
		event.membersCanReadPeriods = false
		if (value === 'membersCanReadPeriods') return
		event.membersCanReadTeams = false
	}
</script>

<form action="{$eventPath}/admin/config?/set_settings" method="post" use:enhance={form.submit}>
	<InputCheckboxs
		value={getMemberRight(event)}
		on:input={handleInputMemberRight}
		label="Les membres peuvent"
		checkboxesClass="flex flex-col sm:gap-6 sm:flex-row"
		options={[
			{ value: 'membersCanReadTeams', label: 'Voir les secteurs' },
			{ value: 'membersCanReadPeriods', label: 'Voir les périodes' },
			{ value: 'membersCanSubscribe', label: "S'inscrire à une période" },
		]}
	/>
</form>

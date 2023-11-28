<script lang="ts">
	import { enhance } from '$app/forms'
	import { InputBoolean, InputCheckboxs } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'

	const form = useForm()

	// TODO: implement setting in figma
	type Settings = {
		membersCanReadTeams: boolean
		membersCanSetPreferedTeams: boolean
		membersCanReadPeriods: boolean
		membersCanSubscribe: boolean
	}
	export let event: Settings = {
		membersCanReadTeams: true,
		membersCanSetPreferedTeams: true,
		membersCanReadPeriods: true,
		membersCanSubscribe: true,
	}

	function getMemberRight(_event: Settings): string[] {
		return [
			event.membersCanReadTeams && 'membersCanReadTeams',
			event.membersCanSetPreferedTeams && 'membersCanSetPreferedTeams',
			event.membersCanReadPeriods && 'membersCanReadPeriods',
			event.membersCanSubscribe && 'membersCanSubscribe',
		].filter(Boolean) as string[]
	}

	function handleInputMemberRight({ target }: Event) {
		const { value, checked } = target as HTMLInputElement
		if (checked) {
			event.membersCanReadTeams = true
			if (value === 'membersCanReadTeams') return
			event.membersCanSetPreferedTeams = true
			if (value === 'membersCanSetPreferedTeams') return
			event.membersCanReadPeriods = true
			if (value === 'membersCanReadPeriods') return
			event.membersCanSubscribe = true
			return
		}

		if (value === 'membersCanReadTeams') {
			event.membersCanSetPreferedTeams = false
		}
		if (value === 'membersCanSetPreferedTeams') {
			event.membersCanSetPreferedTeams = false
			return
		}
		event.membersCanSubscribe = false
		if (value === 'membersCanSubscribe') return
		event.membersCanReadPeriods = false
		if (value === 'membersCanReadPeriods') return
		event.membersCanReadTeams = false
	}
</script>

<form
	action="{$eventPath}/admin/config?/set_settings"
	method="post"
	use:enhance={form.submit}
	class="flex flex-col gap-4"
>
	<InputCheckboxs
		value={getMemberRight(event)}
		on:input={handleInputMemberRight}
		label="Les membres peuvent"
		options={[
			{ value: 'membersCanReadTeams', label: 'voir les secteurs' },
			{
				value: 'membersCanSetPreferedTeams',
				label: "sélectionner les secteurs qu'ils souhaitent rejoindre",
			},
			{ value: 'membersCanReadPeriods', label: 'voir les périodes' },
			{ value: 'membersCanSubscribe', label: "s'inscrire à une période" },
		]}
	/>

	<section>
		<h3 class="label-text">Valider automatiquement</h3>
		<InputBoolean label="les nouveaux membres" />
		<InputBoolean label="les nouvelles inscriptions à des périodes" class="disabled" />
	</section>
</form>

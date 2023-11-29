<script lang="ts">
	import { enhance } from '$app/forms'
	import { InputBoolean, InputCheckboxsTree } from '$lib/material'
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
	<InputCheckboxsTree
		label="Les membres peuvent"
		options={{
			membersCanReadTeams: {
				label: 'voir les secteurs',
				options: {
					membersCanSetPreferedTeams: { label: 'sélectionner leurs secteurs souhaités' },
					membersCanReadPeriods: {
						label: 'voir les périodes',
						options: {
							membersCanSubscribe: { label: "s'inscrire à une période" },
						},
					},
				},
			},
		}}
	/>

	<section>
		<span class="label-text">Valider automatiquement</span>
		<InputBoolean label="les nouveaux membres de l'évènement" />
		<InputBoolean key="prout" label="les nouvelles inscriptions à des périodes" class="disabled" />
	</section>

	<section>
		<span class="label-text">Membre s'étant inscrit</span>
	</section>

	<section>
		<span class="label-text">Membre invité</span>
	</section>
</form>

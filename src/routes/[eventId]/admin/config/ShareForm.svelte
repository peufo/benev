<script>
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputBoolean, InputText, CopyText } from '$lib/material'
	import { eventPath } from '$lib/store'
	import WorkInProgress from '$lib/WorkInProgress.svelte'

	const form = useForm()
</script>

<form action="?/update_event" method="post" use:enhance={form.submit} class="flex flex-col gap-4">
	<CopyText label="Lien de la page d'accueil de l'évènement" value="https://benev.ch{$eventPath}" />

	<CopyText
		label="Lien d'invitation à devenir membre"
		value="https://benev.ch{$eventPath}/invite"
	/>

	<WorkInProgress>
		<InputBoolean
			key="private"
			label="Évènement privé ?"
			hint="Tous le monde peut rejoindre cette évenement"
			input={{ disabled: true }}
		/>
	</WorkInProgress>
</form>

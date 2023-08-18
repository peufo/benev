<script>
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputBoolean, InputText } from '$lib/material/input'
	import { eventPath } from '$lib/store'
	import WorkInProgress from '$lib/WorkInProgress.svelte'

	const form = useForm()
</script>

<form action="?/update_event" method="post" use:enhance={form.submit}>
	<InputText
		key="share-link"
		label="Lien d'invitation"
		value="benev.ch{$eventPath}/invite"
		input={{ readonly: true }}
	/>

	<br />

	<WorkInProgress>
		<InputBoolean
			key="private"
			label="Évènement privé ?"
			hint="Tous le monde peut rejoindre cette évenement"
			input={{ disabled: true }}
		/>
	</WorkInProgress>
</form>

<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { eventPath } from '$lib/store'
	import { InputText } from '$lib/material'

	const form = useForm()
</script>

<form action="{$eventPath}/invite?/new_invite" use:enhance={form.submit}>
	<InputText key="email" label="Email" />
	<InputText key="Prénom" label="firstName" />
	<InputText key="Nom" label="lastName" />
	<div class="flex">
		<button class="btn"> Valider </button>
	</div>
</form>

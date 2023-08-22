<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { InputRadio } from '$lib/material'

	const form = useForm()
</script>

<form use:enhance={form.submit}>
	<InputRadio key="type" label="Type d'entrée" options={{
    text: 'Texte',
    number: 'Nombre',
    boolean: 'Oui / Non',
  }} />
</form>

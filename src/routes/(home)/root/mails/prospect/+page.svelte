<script lang="ts">
	import { enhance } from '$app/forms'
	import { EmailProspect } from '$lib/email'
	import { InputText } from '$lib/material'
	import { useForm } from '$lib/validation'

	const form = useForm()
</script>

<form
	action="?/send_email"
	method="post"
	class="flex gap-2 border bordered p-2 items-end"
	use:enhance={form.submit}
>
	<InputText key="to" label="Destinataires" class="w-full" />

	<button class="btn">Envoyer</button>
</form>

<EmailProspect />

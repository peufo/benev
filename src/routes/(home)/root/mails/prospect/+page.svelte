<script lang="ts">
	import dayjs from 'dayjs'
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'

	import { EmailProspect } from '$lib/email'
	import { InputTextarea } from '$lib/material'
	import { useForm } from '$lib/validation'

	const form = useForm()

	let emailsSend: string[] = []

	onMount(() => {
		const subscription = new EventSource('/root/mails/prospect')
		const handleSendEmail = (event: MessageEvent<string>) => {
			emailsSend = [...emailsSend, `${dayjs().format('hh:mm:ss')} - ${event.data}`]
		}
		subscription.addEventListener('send_email', handleSendEmail)
	})
</script>

<form
	action="?/send_email"
	method="post"
	class="flex gap-2 border bordered p-2 m-2 rounded items-end"
	use:enhance={form.submit}
>
	<InputTextarea key="to" label="Destinataires" class="w-full" />

	<button class="btn">Envoyer</button>
</form>

<ul>
	{#each emailsSend as emailSend}
		<li>{emailSend}</li>
	{/each}
</ul>

<EmailProspect />

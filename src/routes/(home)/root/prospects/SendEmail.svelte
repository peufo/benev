<script lang="ts">
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/validation'
	import type { Prospect } from '@prisma/client'

	export let prospect: Prospect
	const form = useForm()
</script>

<td>
	{#if prospect.lastContact}
		<span>{prospect.lastContact.toLocaleString()}</span>
	{:else}
		<form action="?/send_email" method="post" use:enhance={form.submit}>
			<input type="hidden" name="prospectId" value={prospect.id} />
			<button class="btn btn-primary btn-sm"> Envoyer </button>
		</form>
	{/if}
</td>

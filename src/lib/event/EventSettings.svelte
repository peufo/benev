<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Event } from '@prisma/client'

	import { InputBoolean } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'

	const form = useForm({
		successReset: false,
	})

	export let event: Event
</script>

<form
	action="{$eventPath}/admin/config?/set_settings"
	method="post"
	use:enhance={form.submit}
	class="flex flex-col gap-4"
>
	<InputBoolean
		key="selfRegisterAllowed"
		label="Les utilisateurs peuvent devenir membre sans invitation"
		value={event.selfRegisterAllowed}
	/>
	<InputBoolean
		key="selfSubscribeAllowed"
		label="Les membres peuvent s'inscrire d'eux même aux périodes de travail"
		value={event.selfSubscribeAllowed}
	/>

	<div class="flex justify-end">
		<button class="btn">Valider</button>
	</div>
</form>

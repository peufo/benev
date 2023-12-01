<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Event } from '@prisma/client'

	import { InputBoolean, InputDate } from '$lib/material'
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
	<div>
		<h3 class="font-medium opacity-80">Permissions</h3>
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
	</div>

	<dov>
		<h3 class="font-medium opacity-80">Options</h3>
		<InputDate
			key="closeSubscribing"
			label="Les inscriptions sont par défaut ouvertes jusqu'au"
			value={event.closeSubscribing}
		/>
	</dov>

	<div class="flex justify-end">
		<button class="btn">Valider</button>
	</div>
</form>

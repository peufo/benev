<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Event } from '@prisma/client'

	import { Icon, InputBoolean } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'
	import { mdiShieldLockOutline } from '@mdi/js'

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
		<div class="flex gap-2 items-center text-lg font-medium opacity-80">
			<span> Permissions </span>
			<Icon path={mdiShieldLockOutline} />
		</div>
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

	<div class="flex justify-end">
		<button class="btn">Valider</button>
	</div>
</form>

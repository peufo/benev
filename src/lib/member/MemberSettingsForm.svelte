<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Event } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'
	import { InputBoolean } from '$lib/material'

	const form = useForm({
		successReset: false,
	})

	export let event: Event
</script>

<form
	action="{$eventPath}/admin/config?/set_member_settings"
	method="post"
	use:enhance={form.submit}
>
	<h3 class="font-medium opacity-75 mb-2 mt-4">Informations de compte requises</h3>

	<div class="grid grid-cols-2 gap-x-2">
		<InputBoolean label="Nom & prénom" value={true} input={{ disabled: true }} />
		<InputBoolean label="Adresse email" value={true} input={{ disabled: true }} />
		<InputBoolean
			label="Adresse postale"
			key="userAddressRequired"
			value={event.userAddressRequired}
		/>
		<InputBoolean
			label="Numéro de téléphone"
			key="userPhoneRequired"
			value={event.userPhoneRequired}
		/>
		<InputBoolean
			label="Date de naissance"
			key="userBirthdayRequired"
			value={event.userBirthdayRequired}
		/>
		<InputBoolean
			label="Photo de profil"
			key="userAvatarRequired"
			value={event.userAvatarRequired}
		/>
	</div>

	<div class="flex justify-end">
		<button class="btn">Valider</button>
	</div>
</form>

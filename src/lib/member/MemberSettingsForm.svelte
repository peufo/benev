<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Event } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'
	import { InputBoolean } from '$lib/material'

	const form = useForm()

	export let event: Event
</script>

<form action="{$eventPath}/admin/config?/set_settings" method="post" use:enhance={form.submit}>
	<h3 class="text-lg font-medium opacity-75 mb-2 mt-4">Informations de base requises</h3>

	<div class="grid grid-cols-2 gap-x-2">
		<InputBoolean label="Nom & prénom" value={true} input={{ disabled: true }} />
		<InputBoolean label="Adresse email" value={true} input={{ disabled: true }} />
		<InputBoolean label="Adresse postal" />
		<InputBoolean label="Numéro de téléphone" />
		<InputBoolean label="Date de naissance" />
		<InputBoolean label="Photo de profil" />
	</div>

	<div class="flex justify-end">
		<button class="btn">Valider</button>
	</div>
</form>

<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { eventPath } from '$lib/store'
	import { InputText } from '$lib/material'

	const dispatch = createEventDispatcher<{ success: void }>()
	const form = useForm({
		successCallback: () => dispatch('success'),
		successMessage: 'Invitation envoyée',
	})
</script>

<form
	method="post"
	action="{$eventPath}/invite?/new_invite"
	use:enhance={form.submit}
	class="flex flex-col gap-2"
>
	<InputText key="email" label="Email" input={{ autocomplete: 'off' }} />
	<div class="flex gap-2">
		<InputText key="firstName" label="Prénom" class="grow" input={{ autocomplete: 'off' }} />
		<InputText key="lastName" label="Nom" class="grow" input={{ autocomplete: 'off' }} />
	</div>
	<div class="flex justify-end">
		<button class="btn"> Valider </button>
	</div>
</form>

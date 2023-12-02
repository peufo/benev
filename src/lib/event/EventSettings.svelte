<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Event } from '@prisma/client'

	import { InputBoolean, InputDate } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { useForm } from '$lib/validation'
	import { slide } from 'svelte/transition'

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
			label="Les membres peuvent s'inscrire aux périodes de travail"
			bind:value={event.selfSubscribeAllowed}
		/>
	</div>
	{#if event.selfSubscribeAllowed}
		<div transition:slide={{ duration: 200 }}>
			<h3 class="font-medium opacity-80">Options</h3>
			<InputDate
				key="closeSubscribing"
				label="Fin des inscriptions par défaut"
				value={event.closeSubscribing}
			/>
		</div>
	{/if}

	<div class="flex justify-end">
		<button class="btn">Valider</button>
	</div>
</form>

<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { Event } from '@prisma/client'
	import { eventPath } from '$lib/store'

	export let event: Event
	export let userId: string
	let klass = ''
	export { klass as class }
	export let noCancelButton = false

	const dispatch = createEventDispatcher<{ close: void; success: void }>()

	const form = useForm({
		successMessage: 'Benvenue',
		successCallback: () => dispatch('success'),
	})
</script>

<form
	action="{$eventPath}/invite?/accept_invite"
	method="post"
	class="modal-box flex flex-col gap-4 {klass}"
	use:enhance={form.submit}
>
	<input type="hidden" name="userId" value={userId} />

	<h2 class="card-title">Rejoindre {event.name} ?</h2>

	<p class="text-lg">
		En acceptant, tu permets aux responsables de cet évènemment d'accéder aux informations de ton
		profil.
	</p>

	<div class="flex gap-2 justify-end">
		{#if !noCancelButton}
			<button class="btn btn-ghost" on:click|preventDefault={() => dispatch('close')}> Non </button>
		{/if}
		<button class="btn">Oui je le veux !</button>
	</div>
</form>

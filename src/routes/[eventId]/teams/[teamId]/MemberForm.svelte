<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { enhance } from '$app/forms'
	import { useForm } from '$lib/form'
	import { Event } from '@prisma/client'

	export let event: Event
	export let userId: string

	const dispatch = createEventDispatcher<{ close: void; success: void }>()

	const form = useForm({
		successCallback: () => dispatch('success'),
	})
</script>

<form
	action="?/new_member"
	method="post"
	class="modal-box flex flex-col gap-4"
	use:enhance={form.submit}
>
	<input type="hidden" name="userId" value={userId} />

	<h2 class="card-title">Rejoindre {event.name} ?</h2>

	<p class="text-lg">
		En acceptant, tu permets aux responsables de cet évènemment d'accéder aux informations de ton
		profil.
	</p>

	<div class="flex gap-2 justify-end">
		<button class="btn btn-ghost" on:click|preventDefault={() => dispatch('close')}> Non </button>

		<button class="btn">Oui je le veux !</button>
	</div>
</form>

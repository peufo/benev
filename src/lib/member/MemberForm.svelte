<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/validation'
	import type { Event } from '@prisma/client'
	import { eventPath, urlParam } from '$lib/store'
	import { DeleteButton } from '$lib/material'

	export let event: Event
	export let userId: string
	let klass = ''
	export { klass as class }

	const dispatch = createEventDispatcher<{ close: void; success: void }>()

	const form = useForm({
		successReset: false,
		successCallback: () => dispatch('success'),
	})
</script>

<div class="modal-box flex flex-col gap-4 {klass}">
	<h2 class="card-title">Rejoindre {event.name} ?</h2>

	<p class="text-lg">
		En acceptant, tu permets aux responsables de cet évènemment d'accéder aux informations de ton
		profil.
	</p>

	<div class="flex flex-row-reverse gap-2">
		<form
			action="{$eventPath}/invite?/accept_invite"
			method="post"
			class="contents"
			use:enhance={form.submit}
		>
			<input type="hidden" name="userId" value={userId} />
			<input type="hidden" name="redirectTo" value={$urlParam.with({ section: 'profile' })} />
			<button class="btn">Oui je le veux !</button>
		</form>

		{#if $page.data.member?.isValidedByEvent && !$page.data.member?.isValidedByUser}
			<form method="post" class="contents" use:enhance={form.submit}>
				<input type="hidden" name="memberId" value={$page.data.member.id} />
				<DeleteButton formaction="{$eventPath}/api/members?/delete_member" class="w-36">
					Refuser
				</DeleteButton>
			</form>
		{/if}

		<a href="/me" class="btn btn-ghost"> Non </a>
	</div>
</div>

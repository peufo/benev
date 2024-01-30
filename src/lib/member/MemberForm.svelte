<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import type { Event, Page as TPage } from '@prisma/client'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/validation'
	import { eventPath, urlParam } from '$lib/store'
	import { DeleteButton } from '$lib/material'
	import { Page, tiptap } from '$lib/pages'

	export let event: Event
	export let userId: string
	export let charter: TPage | null
	export let successReset = false
	export let successUpdate = false

	const dispatch = createEventDispatcher<{ close: void; success: void }>()

	const form = useForm({
		successReset,
		successUpdate,
		onSuccess: () => dispatch('success'),
	})
</script>

<section>
	<h2 class="title">Rejoindre {event.name} ?</h2>

	{#if charter}
		<div class="prose">
			{@html tiptap.toHTML(charter.content || '')}
		</div>

		<div class="divider" />

		<p class="mt-2">
			En acceptant, tu affirmes avoir pris connaissance et respecter la chartes des bénévoles
			ci-dessus.
		</p>
	{:else}
		<p class="mt-2">
			En acceptant, tu autorises les responsables de cet évènemment à accéder aux informations de
			ton profil.
		</p>
	{/if}

	<div class="flex flex-row-reverse gap-2 mt-4">
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
</section>

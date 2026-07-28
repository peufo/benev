<script lang="ts">
	import type { Event, Page as TPage } from '@prisma/client'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'
	import { useForm } from '$lib/fuma-legacy/validation'
	import { eventPath } from '$lib/store'
	import { tiptapParser } from '$lib/fuma-legacy'
	import { ButtonDelete } from 'fuma'
	import { urlParam } from 'fuma'

	interface Props {
		event: Event
		charter: TPage | null
		successReset?: boolean
		successUpdate?: boolean
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let { event, charter, successReset = false, successUpdate = false, onsuccess }: Props = $props()

	const form = useForm({
		successReset,
		successUpdate,
		onSuccess: () => onsuccess?.(),
	})
</script>

<section>
	<h2 class="title">Rejoindre {event.name} ?</h2>

	{#if charter}
		<div class="prose">
			<!-- charte rédigée par les admins de l'événement dans l'éditeur tiptap -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html tiptapParser.toHTML(charter.content || '')}
		</div>

		<div class="divider"></div>

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
			<input type="hidden" name="redirectTo" value={urlParam.with({ section: 'profile' })} />
			<button class="btn btn-primary">Oui je le veux !</button>
		</form>

		{#if $page.data.member?.isValidedByEvent && !$page.data.member?.isValidedByUser}
			<form method="post" class="contents" use:enhance={form.submit}>
				<input type="hidden" name="memberId" value={$page.data.member.id} />
				<ButtonDelete formaction="{$eventPath}/api/members?/delete_member" class="w-36">
					Refuser
				</ButtonDelete>
			</form>
		{/if}

		<a href="/me" class="btn btn-ghost"> Non </a>
	</div>
</section>

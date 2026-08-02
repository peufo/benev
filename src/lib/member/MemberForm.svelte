<script lang="ts">
	import type { Event, Page as TPage } from '@prisma/client'
	import { page } from '$app/state'
	import { tiptapParser } from '$lib/ui'
	import { urlParam } from 'fuma'
	import MemberDeleteForm from './MemberDeleteForm.svelte'
	import { acceptInvite } from './member.remote'

	interface Props {
		event: Event
		charter: TPage | null
		/** Remplacent les évènements de la version Svelte 4. */
		onsuccess?: () => void
	}

	let { event, charter, onsuccess }: Props = $props()
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
			{...acceptInvite.enhance(async ({ submit }) => {
				await submit()
				onsuccess?.()
			})}
			class="contents"
		>
			<input type="hidden" name="redirectTo" value={urlParam.with({ section: 'profile' })} />
			<button class="btn btn-primary">Oui je le veux !</button>
		</form>

		{#if page.data.member?.isValidedByEvent && !page.data.member?.isValidedByUser}
			<MemberDeleteForm memberId={page.data.member.id} class="w-36">Refuser</MemberDeleteForm>
		{/if}

		<a href="/me" class="btn btn-ghost"> Non </a>
	</div>
</section>

<script lang="ts">
	import { resolve } from '$app/paths'
	import type { Event, Page as TPage } from '@prisma/client'
	import { page } from '$app/state'
	import { tiptapParser } from '$lib/ui'
	import { ButtonDelete, urlParam } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { acceptInvite, declineInvite } from './member.remote'

	interface Props {
		event: Event
		charter: TPage | null
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
			{...acceptInvite.enhance(enhanceForm({ onsuccess: () => onsuccess?.() }))}
			class="contents"
		>
			<input type="hidden" name="redirectTo" value={urlParam.with({ section: 'profile' })} />
			<button class="btn btn-primary">Oui je le veux !</button>
		</form>

		<!-- Refuser ne supprime pas la fiche, qui appartient à l'évènement: le compte n'y est pas
		     encore relié, et n'en retire que son adresse. -->
		{#if page.data.member?.isValidedByEvent && !page.data.member?.userId}
			<form {...declineInvite.enhance(enhanceForm())} class="contents">
				<input type="hidden" name="memberId" value={page.data.member.id} />
				<ButtonDelete formaction={declineInvite.action} class="w-36">
					{#snippet children({ waitConfirmation })}
						{waitConfirmation ? 'Confirmer' : 'Refuser'}
					{/snippet}
				</ButtonDelete>
			</form>
		{/if}

		<a href={resolve('/me')} class="btn btn-ghost mr-auto"> Retour </a>
	</div>
</section>

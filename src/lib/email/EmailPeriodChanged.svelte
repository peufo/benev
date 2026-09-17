<script lang="ts">
	import type { Event, Member } from '@prisma/client'
	import { ORIGIN } from '$app/env/public'
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { formatRange } from '$lib/formatRange'

	type Range = { start: Date; end: Date }

	/**
	 * Un prénom et trois colonnes de l'évènement suffisent: pas de profil complet à charger par
	 * destinataire. Le fuseau est passé à `formatRange` explicitement, sans lui l'appel lit
	 * `page.data` et lève au rendu serveur.
	 */
	interface Props {
		member: Pick<Member, 'firstName'>
		event: Pick<Event, 'id' | 'name' | 'timezone'>
		teamName: string
		before: Range
		/** `null`: le créneau n'existe plus. */
		after: Range | null
	}

	let { member, event, teamName, before, after }: Props = $props()
</script>

<EmailLayout
	eventId={event.id}
	title={event.name}
	subtitle={after ? 'Un créneau a changé' : 'Un créneau a été supprimé'}
>
	{#if after}
		<p>
			Salut {member.firstName},<br />
			L'horaire d'un créneau auquel tu es inscrit·e vient de changer.
		</p>

		<b>{teamName}</b><br />
		Avant : {formatRange(before, event.timezone)}<br />
		Maintenant : <b>{formatRange(after, event.timezone)}</b>

		<p>
			Ton inscription reste valable pour ce nouvel horaire. Si tu n'es plus disponible, réponds à ce
			courriel ou passe par ton
			<a href="{ORIGIN}/{event.id}/me" rel="external">tableau de bord</a>.
		</p>
	{:else}
		<p>
			Salut {member.firstName},<br />
			Un créneau auquel tu étais inscrit·e a été supprimé.
		</p>

		<b>{teamName}</b><br />
		{formatRange(before, event.timezone)}

		<p>
			Tu n'as rien à faire : cette inscription n'existe plus. Retrouve tes autres inscriptions sur
			ton
			<a href="{ORIGIN}/{event.id}/me" rel="external">tableau de bord</a>.
		</p>
	{/if}
</EmailLayout>

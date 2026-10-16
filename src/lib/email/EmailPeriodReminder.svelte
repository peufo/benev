<script lang="ts">
	import type { Event, Member } from '@prisma/client'
	import { ORIGIN } from '$app/env/public'
	import EmailLayout from '#lib/email/EmailLayout.svelte'
	import { formatRange } from '#lib/formatRange.js'
	import { mapUrl } from '#lib/location/mapUrl.js'

	/** Comme `EmailPeriodChanged`: le fuseau voyage en prop, `formatRange` ne lit pas `page.data`. */
	interface Props {
		member: Pick<Member, 'firstName'>
		event: Pick<Event, 'id' | 'name' | 'timezone' | 'location'>
		teamName: string
		period: { start: Date; end: Date }
	}

	let { member, event, teamName, period }: Props = $props()
</script>

<EmailLayout eventId={event.id} title={event.name} subtitle="Rappel de ton créneau">
	<p>
		Salut {member.firstName},<br />
		Petit rappel : on compte sur toi pour le créneau suivant.
	</p>

	<b>{teamName}</b><br />
	<b>{formatRange(period, event.timezone)}</b>
	{#if event.location}
		<br />
		<a href={mapUrl(event.location)} rel="external">{event.location.label}</a>
	{/if}

	<p>
		Si tu ne peux plus venir, réponds à ce courriel pour prévenir ton équipe. Tu retrouves toutes
		tes inscriptions sur ton
		<a href="{ORIGIN}/{event.id}/me" rel="external">tableau de bord</a>.
	</p>
</EmailLayout>

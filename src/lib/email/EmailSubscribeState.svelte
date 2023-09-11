<script lang="ts">
	import type { Subscribe, Period, Team, Event } from '@prisma/client'
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { formatRange } from '$lib/formatRange'
	import { domain } from '.'

	export let subscribe: Subscribe & {
		period: Period & { team: Team & { event: Event } }
	}

</script>

<EmailLayout
	title={subscribe.period.team.event.name}
	subtitle="Ton inscription a été {subscribe.state === 'accepted' ? 'validée' : 'refusée'}"
>
	{#if subscribe.state === 'accepted'}
		<p>
			Bonne nouvelle ! <br />
			Tu pourras rejoindre le secteur
			<b>{subscribe.period.team.name}</b>
			durant la période suivante :
		</p>
	{:else}
		<p>
			Désolé, ton inscription au secteur
			<b>{subscribe.period.team.name}</b>
			a été refusée pour la période de travail suivante :
		</p>
	{/if}

	<b>{formatRange(subscribe.period)}</b>

	{#if subscribe.state === 'denied'}
		Retourne
		<a href="{domain}/{subscribe.period.team.eventId}/teams">sur la plateforme</a>
		si tu souhaites trouver une autre tranche horaire. Merci pour ta disponibilité !
	{/if}

	<p>
		Tu peux retrouver toutes tes inscription sur
		<a href="{domain}/{subscribe.period.team.eventId}/me">ton tableau de bord.</a>
	</p>
</EmailLayout>

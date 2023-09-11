<script lang="ts">
	import type { Subscribe, Period, Team, User, Event } from '@prisma/client'
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { formatRange } from '$lib/formatRange'
	import { domain } from '.'

	export let subscribe: Subscribe & {
		member: { user: User }
		period: Period & { team: Team & { event: Event } }
	}


	// If author is defined, this mail is destined to leader 
	export let author: {firstName: string, lastName: string} | undefined = undefined

	let to: 'user' | 'leader' = author ? 'user' : 'leader'
</script>

<EmailLayout title={subscribe.period.team.event.name} subtitle="Nouvelle inscription">
	{#if to === 'leader'}
		<!-- On s'adresse au leader -->
		<p>
			Bonne nouvelle ! <br />
			<b>{subscribe.member.user.firstName} {subscribe.member.user.lastName}</b>
			souhaite renforcer le secteur <b>{subscribe.period.team.name}</b>
			durant la période suivante :
		</p>
	{:else if author}
		<p>
			Salut ! <br />
			<b>{author.firstName} {author.lastName}</b> t'invite à rejoindre l'équipe de bénévoles
			<b>{subscribe.period.team.name}</b>
			durant la période suivante.
		</p>
	{/if}

	<b>{formatRange(subscribe.period)}</b>


	{#if to === 'leader'}
	<p>
		Verifie
		<a
			href="{domain}/{subscribe.period.team.eventId}/admin/members/{subscribe.memberId}"
			target="_blank"
		>
			ses informations
		</a>
		et
		<a
			target="_blank"
			href="{domain}/{subscribe.period.team.eventId}/teams/{subscribe.period
				.teamId}/{subscribe.periodId}"
		>
			valide son inscription
		</a>
		si tout te semble ok.
	</p>
	{:else}
		<p>
			Tu peux voir et confirmer tes inscriptions 
			<a href="{domain}/{subscribe.period.team.eventId}/me">
				en cliquant ici.
			</a>
		</p>
	{/if}
</EmailLayout>

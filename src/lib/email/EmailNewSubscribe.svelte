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
	export let author: { firstName: string; lastName: string } | undefined = undefined

	let to: 'user' | 'leader' = subscribe.createdBy === 'user' ? 'leader' : 'user'

	if (subscribe.createdBy === 'leader' && !author) throw new Error('prop "author" is required')
</script>

<EmailLayout title={subscribe.period.team.event.name} subtitle="Nouvelle inscription">
	{#if to === 'leader'}
		<!-- On s'adresse au leader -->
		<p>
			<b>{subscribe.member.user.firstName} {subscribe.member.user.lastName}</b>
			souhaite participer à la période de travail suivante :
		</p>
	{:else if author}
		<p>
			Salut ! <br />
			<b>{author.firstName} {author.lastName}</b> t'invite à rejoindre l'équipe de bénévoles durant la
			période de travail suivante :
		</p>
	{:else}
		<p>
			Salut ! <br />
			Un responsable t'invite à rejoindre l'équipe de bénévoles durant la période de travail suivante
			:
		</p>
	{/if}

	<b>{subscribe.period.team.name}</b><br />
	<b>{formatRange(subscribe.period)}</b>

	{#if to === 'leader'}
		<p>
			Verifie
			<a
				href="{domain}/{subscribe.period.team.eventId}/admin/manage/members/{subscribe.memberId}"
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
			<a href="{domain}/{subscribe.period.team.eventId}/me"> en cliquant ici. </a>
		</p>
	{/if}
</EmailLayout>

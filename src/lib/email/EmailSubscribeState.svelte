<script lang="ts">
	import type { Subscribe, Period, Team, Event, User } from '@prisma/client'
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { formatRange } from '$lib/formatRange'
	import { domain } from '.'

	export let subscribe: Subscribe & {
		member: { user: User }
		period: Period & { team: Team & { event: Event } }
	}

	let to: 'user' | 'leader' = subscribe.createdBy
</script>

<EmailLayout
	title={subscribe.period.team.event.name}
	subtitle="{to === 'user' ? 'Ton' : 'Une'} inscription a été {subscribe.state === 'accepted'
		? 'validée'
		: 'déclinée'}"
>
	{#if subscribe.state === 'accepted'}
		{#if to === 'user'}
			<p>
				Bonne nouvelle ! <br />
				Tu pourras rejoindre la période de travail suivante :
			</p>
		{:else}
			<p>
				Bonne nouvelle ! <br />
				<b>{subscribe.member.user.firstName} {subscribe.member.user.lastName}</b>
				a confirmé sa participation à la période suivante :
			</p>
		{/if}
	{:else if to === 'user'}
		<p>Ton inscription à la période de travail suivante a été déclinée :</p>
	{:else}
		<p>
			<b>{subscribe.member.user.firstName} {subscribe.member.user.lastName}</b>
			a décliné de participer à la période de travail suivante :
		</p>
	{/if}

	<b>{subscribe.period.team.name}</b><br />
	<b>{formatRange(subscribe.period)}</b>

	{#if to === 'user'}
		<p>
			Tu peux trouver toutes tes inscriptions sur
			<a href="{domain}/{subscribe.period.team.eventId}/me">ton tableau de bord.</a>
		</p>
	{:else}
		<p>
			Retrouve toutes les inscriptions de {subscribe.member.user.firstName} sur
			<a href="{domain}/{subscribe.period.team.eventId}/admin/members/{subscribe.memberId}">
				son profil.
			</a>
		</p>
	{/if}
</EmailLayout>

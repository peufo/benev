<script lang="ts">
	import type { MemberWithComputedValues } from '$lib/server'
	import type { SubscribeWithTeam } from '$lib/pages/emailSuggesions'
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { formatRange } from '$lib/formatRange'
	import { domain } from '.'

	export let member: MemberWithComputedValues
	export let subscribe: SubscribeWithTeam
</script>

<EmailLayout title={member.event.name} subtitle="Une inscription a été déclinée">
	<p>
		<b>{member.firstName} {member.lastName}</b>
		a décliné de participer à la période de travail suivante :
	</p>

	<b>{subscribe.period.team.name}</b><br />
	<b>{formatRange(subscribe.period)}</b>

	<p>
		Retrouve toutes les inscriptions de {member.firstName} sur
		<a href="{domain}/{subscribe.period.team.eventId}/admin/members/{subscribe.memberId}">
			son profil.
		</a>
	</p>
</EmailLayout>

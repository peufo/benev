<script lang="ts">
	import type { MemberWithComputedValues } from '$lib/server'
	import type { SubscribeWithTeam } from '$lib/pages/emailSuggesions'
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { formatRange } from '$lib/formatRange'
	import { domain } from '.'

	export let member: MemberWithComputedValues
	export let subscribe: SubscribeWithTeam
</script>

<EmailLayout title={member.event.name} subtitle="Nouvelle inscription">
	<p>
		<b>{member.user.firstName} {member.user.lastName}</b>
		souhaite participer à la période de travail suivante :
	</p>

	<b>{subscribe.period.team.name}</b><br />
	<b>{formatRange(subscribe.period)}</b>

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
</EmailLayout>

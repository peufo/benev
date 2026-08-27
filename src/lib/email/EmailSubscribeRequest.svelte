<script lang="ts">
	import type { MemberWithComputedValues } from '$lib/server'
	import type { SubscribeWithTeam } from '$lib/pages/emailSuggesions'
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { formatRange } from '$lib/formatRange'
	import { ORIGIN } from '$app/env/public'

	interface Props {
		member: MemberWithComputedValues
		subscribe: SubscribeWithTeam
	}

	let { member, subscribe }: Props = $props()
</script>

<EmailLayout eventId={member.event.id} title={member.event.name} subtitle="Nouvelle inscription">
	<p>
		<b>{member.firstName} {member.lastName}</b>
		souhaite participer à la période de travail suivante :
	</p>

	<b>{subscribe.period.team.name}</b><br />
	<b>{formatRange(subscribe.period, member.event.timezone)}</b>

	<p>
		Vérifie
		<a
			href="{ORIGIN}/{subscribe.period.team.eventId}/admin/members/{subscribe.memberId}"
			rel="external"
			target="_blank"
		>
			ses informations
		</a>
		et
		<a
			rel="external"
			target="_blank"
			href="{ORIGIN}/{subscribe.period.team.eventId}/teams?section={subscribe.period
				.teamId}&form_period={subscribe.periodId}"
		>
			valide son inscription
		</a>
		si tout te semble ok.
	</p>
</EmailLayout>

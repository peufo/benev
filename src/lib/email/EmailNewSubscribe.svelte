<script lang="ts">
	import type { Subscribe, Period, Team, User, Event } from '@prisma/client'
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { formatRange } from '$lib/formatRange'
	import { domain } from '.'

	export let subscribe: Subscribe & {
		member: { user: User }
		period: Period & { team: Team & { event: Event } }
	}
</script>

<EmailLayout title={subscribe.period.team.event.name} subtitle="Nouvelle inscription">
	<p>
		Bonne nouvelle ! <br />
		<b>{subscribe.member.user.firstName} {subscribe.member.user.lastName}</b>
		souhaite renforcer le secteur <b>{subscribe.period.team.name}</b>
		durant la période suivante :
	</p>

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
				.teamId}?periodOpen={subscribe.periodId}"
		>
			valide son inscription
		</a>
		si tout te semble ok.
	</p>
</EmailLayout>

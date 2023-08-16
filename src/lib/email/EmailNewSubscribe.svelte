<script lang="ts">
	import { dev } from '$app/environment'
	import type { Subscribe, Period, Team, User, Event } from '@prisma/client'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')

	export let subscribe: Subscribe & {
		member: { user: User }
		period: Period & { team: Team & { event: Event } }
	}
	const domain = dev ? 'http://localhost:5173' : 'https://benev.ch'
</script>

<h1>
	{subscribe.period.team.event.name}<br />
	Nouvelle inscription
</h1>

<p>
	Bonne nouvelle ! <br />
	<b>{subscribe.member.user.firstName} {subscribe.member.user.lastName}</b>
	souhaite renforcer l'équipe <b>{subscribe.period.team.name}</b>
	durant la période suivante :
</p>

<table style="max-width: 300px;">
	<tbody>
		<tr>
			<th style="text-align: left; padding-right: 30px;">Début</th>
			<th style="text-align: right;">
				{dayjs(subscribe.period.start).format('dddd MM.DD.YYYY à HH:mm')}
			</th>
		</tr>
		<tr>
			<th style="text-align: left; padding-right: 30px;">Fin</th>
			<th style="text-align: right;">
				{dayjs(subscribe.period.end).format('dddd MM.DD.YYYY à HH:mm')}
			</th>
		</tr>
	</tbody>
</table>

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

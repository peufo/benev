<script lang="ts">
	import { dev } from '$app/environment'
	import type { Subscribe, Period, Team, Event } from '@prisma/client'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	dayjs.locale('fr-ch')

	export let subscribe: Subscribe & {
		period: Period & { team: Team & { event: Event } }
	}
	const  domain = dev ? 'http://localhost:5173' : 'https://benev.ch'
	
</script>

<h1>
	{subscribe.period.team.event.name}<br />
	Ton inscription a été {subscribe.state === 'accepted' ? 'validée' : 'refusée'}
</h1>

{#if subscribe.state === 'accepted'}
	<p>
		Bonne nouvelle ! <br />
		Tu pourras rejoindre l'équipe
		<b>{subscribe.period.team.name}</b>
		durant la période suivante :
	</p>
{:else}
	<p>
		Désolé, un des responsables de l'équipe
		<b>{subscribe.period.team.name}</b>
		a refusé ton inscription à la période de travail suivante :
	</p>
{/if}

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
	Tu peux trouver toutes les informations dont tu as besoins dans
	<a href="{domain}/me">ton tableau de bord.</a>
</p>

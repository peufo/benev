<script lang="ts">
	import type { Event, User } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { ORIGIN } from '$app/env/public'
	import dayjs from '#lib/dayjs.js'
	import { ARCHIVE_IDLE_DAYS } from '#lib/event/eventArchive.js'

	interface Props {
		event: Pick<Event, 'id' | 'name' | 'timezone'>
		owner: Pick<User, 'firstName'>
		archiveAt: Date
	}

	let { event, owner, archiveAt }: Props = $props()
</script>

<EmailLayout eventId={event.id} title="Archivage prévu - {event.name}">
	<p>
		Salut {owner.firstName},<br />
		L'évènement <b>{event.name}</b> semble terminé : rien n'y a bougé depuis plus de
		{ARCHIVE_IDLE_DAYS} jours.
	</p>

	<p>
		Sans nouvelles de ta part, il sera archivé le
		<b>{dayjs(archiveAt).tz(event.timezone).format('D MMMM YYYY')}</b>. Son site se refermera aux
		bénévoles, mais rien ne sera supprimé, et tu pourras le republier à tout moment.
	</p>

	<p style="text-align: center; margin: 24px 0;">
		<a
			href="{ORIGIN}/{event.id}/admin/settings"
			rel="external"
			style="
				background: #0d3b66;
				color: #fff;
				padding: 12px 24px;
				border-radius: 6px;
				text-decoration: none;
				display: inline-block;
				font-weight: 600;
			"
		>
			Garder l'évènement ouvert
		</a>
	</p>

	<p style="font-size: 12px; opacity: 0.7;">Si l'évènement est bien fini, tu n'as rien à faire.</p>
</EmailLayout>

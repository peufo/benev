<script lang="ts">
	import type { Event, Member } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { ORIGIN } from '$app/env/public'

	interface Props {
		member: Member & { event: Event }
	}

	let { member }: Props = $props()
</script>

<EmailLayout
	eventId={member.event.id}
	title={member.event.name}
	subtitle="Un nouveau membre a rejoint l'évènement"
>
	<p>
		<b>{member.firstName} {member.lastName}</b>
		fait désormais partie de l'évènement.
	</p>
	<p>
		Tu peux trouver toutes ses informations
		<a href="{ORIGIN}/{member.event.id}/admin/members/{member.id}" rel="external">
			sur son profil.
		</a>
	</p>
</EmailLayout>

<script lang="ts">
	import { Event, Field, Member, User } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'

	export let member: Member & { user: User; event: Event & { memberFields: Field[] } }
</script>

<EmailLayout title={member.event.name} subtitle="Un nouveau membre a rejoint l'évènement">
	<p>
		<b>{member.user.firstName} {member.user.lastName}</b>
		fait désormais parti de l'évenement.
	</p>
	<p>
		Tu peux trouver toutes ses informations
		<a href="{domain}/{member.event.id}/admin/members/{member.id}">sur son profil.</a>
	</p>
</EmailLayout>

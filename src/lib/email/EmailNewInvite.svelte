<script lang="ts">
	import { Event, Field, Member, User } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'

	export let member: Member & { user: User; event: Event }
	export let authorName: string
	export let tokenId: string
</script>

<EmailLayout title={member.event.name}>
	<p>
		Salut {member.user.firstName}, <br />
		{authorName} t'invite à rejoindre l'équipe de bénévoles {member.event.name}.
	</p>

	<p>
		Tu peux accéder à ton compte et définir ton mot de passe en
		<a href="{domain}/token/{tokenId}/reset_password" data-sveltekit-preload-data="off">
			cliquant sur ce lien.
		</a>
	</p>
</EmailLayout>

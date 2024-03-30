<script lang="ts">
	import type { Event, Member, User } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'

	export let member: Member & { user: User; event: Event }
	export let authorName: string
	export let tokenId: string = '' // only for new user
</script>

<EmailLayout title={member.event.name}>
	<p>
		Salut {member.user.firstName}, <br />
		{authorName} t'invite à rejoindre l'équipe de bénévoles {member.event.name}.
	</p>

	{#if tokenId}
		<p>
			Tu peux accéder à ton compte et définir ton mot de passe en
			<a
				href="{domain}/token/{tokenId}/reset_password?redirectTo=/{member.eventId}/me"
				data-sveltekit-preload-data="off"
			>
				cliquant sur ce lien.
			</a>
		</p>
	{:else}
		<p>
			Tu peux accepter ton invitation et trouver plus d'informations en
			<a href="{domain}/{member.eventId}/me" data-sveltekit-preload-data="off">
				cliquant sur ce lien.
			</a>
		</p>
	{/if}
</EmailLayout>

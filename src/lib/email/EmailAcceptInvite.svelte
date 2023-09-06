<script lang="ts">
	import { Event, Field, Member, User } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'

	export let member: Member & { user: User; event: Event & { memberFields: Field[] } }
</script>

<EmailLayout title={member.event.name} subtitle="Bienvenue dans notre équipe bénévole">
	<p>
		Salut {member.user.firstName},<br />
		Tu fais désormais parti des notres. Cela implique que les responsables peuvent accèder aux informations
		de ton profil.
	</p>

	{#if member.event.memberFields.length}
		<p>
			Avant d'accepter tes inscriptions à des période de travails, nous avons besoins de quelques
			informations supplémentaire te concernant. Si ce n'est pas déjà fait, tu peux les renseigner
			<a href="{domain}/{member.event.id}/me/profile#member-profile-{member.event.id}">
				sur ton profil
			</a>.
		</p>
	{/if}

	<p>Un énorme merci pour ta disponibilité !</p>
</EmailLayout>

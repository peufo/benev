<script lang="ts">
	import type { Event, Field, Member, User } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'

	export let member: Member & { user: User; event: Event & { memberFields: Field[] } }
</script>

<EmailLayout title={member.event.name} subtitle="Bienvenue dans notre équipe bénévole">
	<p>
		Salut {member.user.firstName},<br />
		Tu fais désormais partie des nôtres. Tu peux maintenant compléter
		<a href="{domain}/{member.eventId}/me?section=profile-spiegelberg-festival"> ton profil </a>
		si ce n'est déjà fait et t'inscrire aux tranches horaires qui t'intéressent en consultant les différents
		<a href="{domain}/{member.eventId}/teams">secteurs</a>.
	</p>

	<p>
		Les responsables qui ont accès à ton profil pourront ensuite valider tes tranches horaires et
		prendre contact avec toi le moment venu.
	</p>

	<p>Un énorme merci pour ta disponibilité !</p>

	<p>Toute l'équipe {member.event.name}</p>
</EmailLayout>

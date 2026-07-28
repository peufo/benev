<script lang="ts">
	import { EmailAcceptInviteNotification } from '$lib/email'

	export let data
</script>

<!-- Prévisualisation réservée au root: emails rendus côté serveur, pas de saisie visiteur -->
<!-- eslint-disable svelte/no-at-html-tags -->
{@html data.emailInvitation}
{@html data.emailInvitationAccept}
<!-- eslint-enable svelte/no-at-html-tags -->

<hr />

<EmailAcceptInviteNotification {...data} />

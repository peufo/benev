<script lang="ts">
	import { EmailAcceptInviteNotification } from '$lib/email'

	export let data
</script>

{@html data.emailInvitation}
{@html data.emailInvitationAccept}

<hr>

<EmailAcceptInviteNotification {...data} />

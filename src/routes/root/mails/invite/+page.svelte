<script lang="ts">
	import { EmailAcceptInvite, EmailAcceptInviteNotification, EmailNewInvite } from '$lib/email'

	export let data
</script>

<EmailNewInvite {...data} authorName="Magicarp" tokenId="prout" />

<EmailAcceptInvite {...data} />

<EmailAcceptInviteNotification {...data} />

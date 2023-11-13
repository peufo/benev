<script lang="ts">
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { domain } from '.'

	export let isNewUser = false
	export let tokenId: string
</script>

<EmailLayout title={isNewUser ? 'Bienvenue sur benev.io' : 'Verification de ton adresse mail'}>
	<p>
		Tu peux valider ton adresse email en
		<a href="{domain}/token/{tokenId}/email_verification" data-sveltekit-preload-data="off">
			cliquant sur ce lien.
		</a>
	</p>
</EmailLayout>

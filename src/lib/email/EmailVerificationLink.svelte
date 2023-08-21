<script lang="ts">
	import { dev } from '$app/environment'
	import EmailLayout from '$lib/email/EmailLayout.svelte'

	export let isNewUser = false
	export let tokenId: string
	const domain = dev ? 'http://localhost:5173' : 'https://benev.ch'
</script>

<EmailLayout title={isNewUser ? 'Bienvenu sur benev.ch' : 'Verification de ton adresse mail'}>
	<p>
		Tu peux valider ton adresse email en
		<a href="{domain}/token/{tokenId}/email_verification" data-sveltekit-preload-data="off">
			cliquant sur ce lien.
		</a>
	</p>
</EmailLayout>

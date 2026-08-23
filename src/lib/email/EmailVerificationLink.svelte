<script lang="ts">
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { domain } from '.'

	interface Props {
		isNewUser?: boolean
		tokenId: string
	}

	let { isNewUser = false, tokenId }: Props = $props()
</script>

<EmailLayout title={isNewUser ? 'Bienvenue sur benev.io' : 'Verification de ton adresse mail'}>
	<p>
		Tu peux valider ton adresse email en
		<a
			href="{domain}/token/{tokenId}/email_verification"
			rel="external"
			data-sveltekit-preload-data="off"
		>
			cliquant sur ce lien.
		</a>
	</p>
</EmailLayout>

<script lang="ts">
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { domain } from '.'

	export let tokenId: string
</script>

<EmailLayout title="Reinitialisation du mot de passe">
	<p>
		Tu peux changer ton mot de passe en
		<a href="{domain}/token/{tokenId}/reset_password" data-sveltekit-preload-data="off">
			cliquant sur ce lien.
		</a>
	</p>
</EmailLayout>

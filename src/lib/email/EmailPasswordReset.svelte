<script lang="ts">
	import EmailLayout from '$lib/email/EmailLayout.svelte'
	import { ORIGIN } from '$app/env/public'

	interface Props {
		tokenId: string
	}

	let { tokenId }: Props = $props()
</script>

<EmailLayout title="Reinitialisation du mot de passe">
	<p>
		Tu peux changer ton mot de passe en
		<a
			href="{ORIGIN}/token/{tokenId}/reset_password"
			rel="external"
			data-sveltekit-preload-data="off"
		>
			cliquant sur ce lien.
		</a>
	</p>
</EmailLayout>

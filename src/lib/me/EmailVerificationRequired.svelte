<script lang="ts">
	import { MailWarningIcon } from '@lucide/svelte'
	import { resolve } from '$app/paths'
	import { Section } from '$lib/ui'
	import EmailVerificationButton from './EmailVerificationButton.svelte'

	interface Props {
		email: string
	}

	let { email }: Props = $props()

	let sent = $state(false)
</script>

<Section
	id="email-confirmation-required"
	class="max-w-lg mx-auto"
	title="Confirme ton adresse email"
	icon={MailWarningIcon}
>
	<p class="mt-4 leading-relaxed">
		Pour continuer, tu dois d'abord confirmer ton adresse email: <br />
		<b class="break-all">{email}</b>.
	</p>

	<div class="mt-8 flex flex-wrap gap-2 flex-row-reverse justify-between">
		<EmailVerificationButton bind:sent />
		<a href={resolve('/me')} class="btn btn-ghost">Retour</a>
	</div>

	{#if sent}
		<p class="mt-4 text-sm">Ouvre le lien reçu à cette adresse, puis reviens sur cette page.</p>
	{/if}
</Section>

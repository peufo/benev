<script lang="ts">
	import type { Checkout, User } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'

	export let checkout: Checkout & { user: User }
	export let dest: 'user' | 'root' = 'user'
</script>

<EmailLayout title={dest === 'user' ? 'Merci pour ta donation' : 'Nouvelle donation'}>
	{#if dest === 'user'}
		<p>
			Salut {checkout.user.firstName},<br />
			Nous avons bien reçu ta donation d'un montant de
			<b>
				{(checkout.amount / 100).toFixed(2)}
				{checkout.currency.toUpperCase()}
			</b>.
		</p>
		<p>Un énorme merci pour ton soutien ! ❤️</p>
	{:else}
		<p>
			Salut,<br />
			<b>{checkout.user.firstName} {checkout.user.lastName}</b>
			a fait un donation d'un montant de
			<b>
				{(checkout.amount / 100).toFixed(2)}
				{checkout.currency.toUpperCase()}
			</b>.
		</p>
	{/if}
</EmailLayout>

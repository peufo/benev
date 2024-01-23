<script lang="ts">
	import type { Checkout, User, Licence } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'
	import { LICENCE_TYPE_LABEL } from '$lib/constant'

	export let checkout: Checkout & { user: User; licences: Licence[] }
	export let dest: 'user' | 'root' = 'user'

	const licencesEvent = checkout.licences.filter((l) => l.type === 'event')
	const licencesMember = checkout.licences.filter((l) => l.type === 'member')
</script>

<EmailLayout title={dest === 'user' ? 'Merci pour ton achat' : 'Nouvel achat de licences'}>
	{#if dest === 'user'}
		<p>
			Salut {checkout.user.firstName},<br />
			Nous te confirmons l'achat des licences suivantes :
		</p>
	{:else}
		<p>
			Salut,<br />
			<b>{checkout.user.firstName} {checkout.user.lastName}</b>
			a acheté les licences suivantes :
		</p>
	{/if}

	<table style="width: 100%; border: #ccc solid 1px;">
		<thead>
			<tr>
				<th style="border-bottom: #ccc solid 1px;">Licence</th>
				<th style="border-bottom: #ccc solid 1px;" align="right">Quantité</th>
			</tr>
		</thead>
		<tbody>
			{#if licencesEvent.length}
				<tr>
					<th>{LICENCE_TYPE_LABEL.event}</th>
					<th align="right">{licencesEvent.length}</th>
				</tr>
			{/if}

			{#if licencesMember.length}
				<tr>
					<th>{LICENCE_TYPE_LABEL.member}</th>
					<th align="right">{licencesMember.length}</th>
				</tr>
			{/if}
		</tbody>
	</table>

	<div style="text-align: right; padding: 3px;">
		Prix :
		<b>
			{(checkout.amount / 100).toFixed(2)}
			{checkout.currency.toUpperCase()}
		</b>
	</div>
	{#if dest === 'user'}
		<p>
			Tu peux retrouver tous tes achats sur
			<a href="{domain}/me/licences">ton profil.</a>
		</p>

		<p>Merci pour ta confiance !</p>
	{/if}
</EmailLayout>

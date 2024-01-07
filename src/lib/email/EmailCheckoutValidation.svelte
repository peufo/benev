<script lang="ts">
	import type { Checkout, User, Licence } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'
	import { LICENCE } from '$lib/constant'

	export let checkout: Checkout & { user: User; licences: Licence[] }
	export let dest: 'user' | 'root' = 'user'
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
				<th style="border-bottom: #ccc solid 1px;" align="right">Prix</th>
			</tr>
		</thead>
		<tbody>
			{#each checkout.licences as licence}
				<tr>
					<th>{LICENCE[licence.type]}</th>
					<th align="right">{licence.quantity}</th>
					<th align="right">
						{(licence.price / 100).toFixed(2)}
						{checkout.currency.toUpperCase()}
					</th>
				</tr>
			{/each}
		</tbody>
	</table>

	<div style="text-align: right; padding: 3px;">
		Total :
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

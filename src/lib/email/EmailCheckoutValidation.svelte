<script lang="ts">
	import type { Checkout, User, Product } from '@prisma/client'
	import EmailLayout from './EmailLayout.svelte'
	import { domain } from '.'

	export let checkout: Checkout & { user: User; products: Product[] }
	export let dest: 'user' | 'root' = 'user'
</script>

<EmailLayout title={dest === 'user' ? 'Merci pour ton achat' : 'Nouvel achat'}>
	{#if dest === 'user'}
		<p>
			Salut {checkout.user.firstName},<br />
			Nous te confirmons l'achat des produits suivantes :
		</p>
	{:else}
		<p>
			Salut,<br />
			<b>{checkout.user.firstName} {checkout.user.lastName}</b>
			a acheté les produits suivantes :
		</p>
	{/if}

	<table style="width: 100%; border: #ccc solid 1px;">
		<thead>
			<tr>
				<th style="border-bottom: #ccc solid 1px;">Produit</th>
				<th style="border-bottom: #ccc solid 1px;" align="right">Quantité</th>
			</tr>
		</thead>
		<tbody>
			{#each checkout.products as product}
				<tr>
					<th>{product.name}</th>
					<th align="right">1</th>
				</tr>
			{/each}
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
			<a href="{domain}/me/checkouts">ton profil.</a>
		</p>

		<p>Merci pour ta confiance !</p>
	{/if}
</EmailLayout>

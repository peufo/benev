<script lang="ts">
	import { resolve } from '$app/paths'
	import type { Checkout, Event, Product, User } from '@prisma/client'
	import { productTierLabel } from './productTier'

	interface Props {
		products: (Product & {
			event: Pick<Event, 'id' | 'name'> | null
			checkout: Checkout & { user: User }
		})[]
		/** Sur la page d'un évènement, la colonne répéterait partout le même nom. */
		hideEvent?: boolean
	}

	let { products, hideEvent = false }: Props = $props()
</script>

<table class="table">
	<thead>
		<tr>
			<th>Nom</th>
			<th>Licence</th>
			{#if !hideEvent}
				<th>Évènement</th>
			{/if}
			<th>Acheteur·euse</th>
			<th>Checkout</th>
			<th>Créé le</th>
		</tr>
	</thead>
	<tbody>
		{#each products as product (product.id)}
			<tr>
				<td>{product.name}</td>
				<td>
					<span class="badge badge-sm badge-ghost">{productTierLabel(product.priceId)}</span>
				</td>
				{#if !hideEvent}
					<td>
						{#if product.event}
							<a
								href={resolve('/(home)/root/events/[eventId]', { eventId: product.event.id })}
								class="link link-hover"
							>
								{product.event.name}
							</a>
						{:else}
							<span class="badge badge-sm badge-warning">Non activé</span>
						{/if}
					</td>
				{/if}
				<td>
					<a
						href={resolve('/(home)/root/users/[userId]', { userId: product.checkout.user.id })}
						class="link link-hover"
					>
						{product.checkout.user.firstName}
						{product.checkout.user.lastName}
					</a>
				</td>
				<td class="whitespace-nowrap">
					{(product.checkout.amount / 100).toFixed(2)}
					{product.checkout.currency}
				</td>
				<td>{product.createdAt.toLocaleDateString()}</td>
			</tr>
		{/each}
	</tbody>
</table>

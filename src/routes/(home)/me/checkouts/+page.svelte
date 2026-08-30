<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import { CircleCheckIcon, ShoppingCartIcon, TagIcon } from '@lucide/svelte'
	import { Placeholder } from '$lib/ui'

	import { CheckoutWaitSSE, ProductUseForm } from '$lib/checkout'

	let { data } = $props()

	let checkoutId = $derived(page.url.searchParams.get('checkoutId'))

	const dayFormater = new Intl.DateTimeFormat('fr-ch', { day: 'numeric', month: 'short' })
</script>

<h1 class="sr-only">Mes achats</h1>

<div class="mt-4 flex flex-col gap-4">
	<CheckoutWaitSSE
		allreadyLoaded={(checkoutId) => !!data.checkouts.find(({ id }) => id === checkoutId)}
		eventSource="/me/checkouts/validation"
	/>

	<ul>
		{#each data.checkouts as checkout (checkout.id)}
			<li
				class={[
					'border-t border-soft px-2 py-3 first:border-t-0 sm:px-3',
					checkout.id === checkoutId && 'rounded-lg border-t-0 bg-secondary/10',
				]}
			>
				<div class="flex items-center gap-3 sm:gap-4">
					<!-- Le bord gauche du registre: la date d'achat -->
					<div class="w-12 shrink-0 text-center sm:w-14">
						<div class="text-sm leading-tight font-semibold whitespace-nowrap tabular-nums">
							{dayFormater.format(checkout.createdAt)}
						</div>
						<div class="text-xs text-base-content/70 tabular-nums">
							{checkout.createdAt.getFullYear()}
						</div>
					</div>

					<div class="min-w-0 grow">
						<div class="truncate font-medium">{checkout.name || 'Achat'}</div>
						{#if !checkout.products.length}
							<!-- Sans cette ligne, une écriture sans produit n'est qu'un montant nu:
							     l'utilisateur ne peut pas savoir si quelque chose manque. On ne
							     déduit rien du montant — un achat à 0 CHF reste un achat. -->
							<div class="text-sm text-base-content/70">Aucun produit rattaché</div>
						{/if}
					</div>

					<div class="shrink-0 font-semibold tabular-nums">
						{(checkout.amount / 100).toFixed(2)}
						{checkout.currency?.toUpperCase()}
					</div>
				</div>

				{#if checkout.products.length}
					<!-- Aligné sur la colonne principale: date (w-12/w-14) + gap (3/4) -->
					<ul class="mt-1 ml-15 sm:ml-18">
						{#each checkout.products as product (product.id)}
							<li
								class="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-soft py-2 first:border-t-0"
							>
								<div class="flex min-w-0 grow items-center gap-2">
									<TagIcon size={16} class="shrink-0 opacity-60" />
									<span class="truncate">{product.name}</span>
								</div>

								<div class="flex flex-col sm:w-80 sm:items-end">
									{#if product.event?.deletedAt}
										<span class="text-sm text-base-content/70">
											Affecté à un évènement supprimé
										</span>
									{:else if product.event}
										<a
											href={resolve('/[eventId]', { eventId: product.event.id })}
											class="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
										>
											<CircleCheckIcon size={14} />
											<span>Actif sur <span class="font-medium">{product.event.name}</span></span>
										</a>
									{:else}
										<ProductUseForm {product} />
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{:else}
			<Placeholder class="gap-3 text-center">
				<ShoppingCartIcon size={48} class="opacity-40 mx-auto" />
				<p>Tu n'as fait aucun achat</p>
			</Placeholder>
		{/each}
	</ul>
</div>

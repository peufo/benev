<script lang="ts">
	import { page } from '$app/stores'
	import { mdiCartCheck, mdiCheckCircle, mdiGiftOutline, mdiTagOutline } from '@mdi/js'
	import { Card, Icon, Placeholder } from 'fuma'

	import { CheckoutWaitSSE, ProductUseForm } from '$lib/checkout'

	export let data

	const checkoutId = $page.url.searchParams.get('checkoutId')
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col sm:flex-row sm:items-center gap-4">
		<h1 class="title">Mes achats</h1>
	</div>

	<CheckoutWaitSSE
		allreadyLoaded={(checkoutId) => !!data.checkouts.find(({ id }) => id === checkoutId)}
		eventSource="/me/checkouts/validation"
	/>

	{#each data.checkouts as checkout}
		<Card
			class={checkout.id === checkoutId ? 'border-2 border-primary' : ''}
			bodyClass="flex flex-col gap-4"
		>
			<div slot="title" class="flex flex-col">
				<div class="flex items-center gap-2">
					<Icon path={mdiCartCheck} class="text-primary" />
					<span class="font-semibold">{checkout.name || 'Achat'}</span>
				</div>
				<span class="text-sm opacity-70">{checkout.createdAt.toLocaleDateString()}</span>
			</div>

			<div slot="action" class="text-right">
				<div class="text-lg font-bold">
					{(checkout.amount / 100).toFixed(2)}
					{checkout.currency?.toUpperCase()}
				</div>
			</div>

			<div class="flex flex-col">
				{#each checkout.products as product, index}
					<div
						class="flex flex-col sm:flex-row sm:items-center gap-3 py-3"
						class:border-t={index > 0}
						class:border-base-200={index > 0}
					>
						<div class="flex items-center gap-2 min-w-0 grow">
							<Icon path={mdiTagOutline} class="opacity-60 shrink-0" size={18} />
							<span>{product.name}</span>
						</div>

						<div class="flex flex-col sm:items-end sm:w-80">
							{#if product.event}
								<a
									href="/{product.event.id}"
									class="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
								>
									<Icon path={mdiCheckCircle} size={14} />
									<span>Actif sur <span class="font-medium">{product.event.name}</span></span>
								</a>
							{:else}
								<ProductUseForm {product} />
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</Card>
	{:else}
		<Placeholder class="gap-3">
			<Icon path={mdiGiftOutline} size={48} class="opacity-40" />
			<p>Tu n'as fait aucun achat</p>
		</Placeholder>
	{/each}
</div>

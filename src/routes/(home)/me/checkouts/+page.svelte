<script lang="ts">
	import { page } from '$app/stores'
	import { env } from '$env/dynamic/public'
	import { mdiCartCheck, mdiCheckCircle, mdiGiftOutline, mdiTagOutline } from '@mdi/js'
	import { Card, Icon, Placeholder } from 'fuma'

	import { CheckoutWaitSSE, ProductUseForm } from '$lib/checkout'

	export let data

	const checkoutId = $page.url.searchParams.get('checkoutId')
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col sm:flex-row sm:items-center gap-4">
		<h1 class="title">Mes achats</h1>

		<div class="sm:ml-auto flex flex-wrap gap-2">
			<a
				class="btn"
				data-sveltekit-preload-data="off"
				href="/me/checkouts/create?price={env.PUBLIC_PRICE_STANDARD}"
			>
				Licence standard
			</a>
			<a
				class="btn"
				data-sveltekit-preload-data="off"
				href="/me/checkouts/create?price={env.PUBLIC_PRICE_STANDARD_TO_PREMIUM}"
			>
				Passer premium
			</a>
			<a
				class="btn btn-primary"
				data-sveltekit-preload-data="off"
				href="/me/checkouts/create?price={env.PUBLIC_PRICE_PREMIUM}"
			>
				Licence premium
			</a>
		</div>
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
			<div slot="title" class="flex items-center gap-2">
				<Icon path={mdiCartCheck} class="text-primary" />
				<span>{checkout.name || 'Achat'}</span>
			</div>

			<div slot="subtitle" class="text-sm opacity-70">
				{checkout.createdAt.toLocaleDateString()}
			</div>

			<div slot="action" class="font-semibold whitespace-nowrap">
				{(checkout.amount / 100).toFixed(2)}
				{checkout.currency?.toUpperCase()}
			</div>

			<div class="flex flex-col gap-2">
				{#each checkout.products as product}
					<div class="flex flex-col sm:flex-row sm:items-start gap-3 p-3 rounded-lg bg-base-200/50">
						<div class="flex items-center gap-2 min-w-0 grow">
							<Icon path={mdiTagOutline} class="opacity-70 shrink-0" />
							<span>{product.name}</span>
						</div>

						<div class="flex flex-col gap-2 sm:items-end sm:w-80">
							{#if product.event}
								<span class="badge badge-success gap-1">
									<Icon path={mdiCheckCircle} size={14} />
									Utilisé sur {product.event.name}
								</span>
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

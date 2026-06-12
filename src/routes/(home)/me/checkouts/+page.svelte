<script lang="ts">
	import { Placeholder } from 'fuma'
	import { page } from '$app/stores'
	import { CheckoutWaitSSE } from '$lib/checkout'
	import { env } from '$env/dynamic/public'

	export let data

	const checkoutId = $page.url.searchParams.get('checkoutId')
</script>

<div class="flex items-center">
	<div class="title">Mes achats</div>

	<a
		class="btn ml-auto"
		data-sveltekit-preload-data="off"
		href="/me/checkouts/create?price={env.PUBLIC_PRICE_STANDARD}">standard</a
	>
	<a
		class="btn"
		data-sveltekit-preload-data="off"
		href="/me/checkouts/create?price={env.PUBLIC_PRICE_STANDARD_TO_PREMIUM}"
	>
		standard to premium
	</a>
	<a
		class="btn"
		data-sveltekit-preload-data="off"
		href="/me/checkouts/create?price={env.PUBLIC_PRICE_PREMIUM}&eventId=festival-des-fleurs-2026"
	>
		premium
	</a>

	<!-- TODO: use this link for create checkout: /me/checkouts/create?price=${env.PUBLIC_PRICE_PREMIUM} -->
</div>

<div class="flex flex-col gap-2">
	<CheckoutWaitSSE
		allreadyLoaded={(checkoutId) => !!data.checkouts.find(({ id }) => id === checkoutId)}
		eventSource="/me/checkouts/validation"
	/>

	{#each data.checkouts as checkout}
		<section
			class="border rounded p-4 pt-2"
			class:border-primary={checkout.id === checkoutId}
			class:border-2={checkout.id === checkoutId}
		>
			<div class="flex gap-2 items-top">
				<div class="flex flex-wrap gap-x-2 gap-y-0 items-center">
					<h3 class="font-semibold opacity-80">{checkout.name || ''}</h3>
					<span class="text-xs italic opacity-70">
						{checkout.createdAt.toLocaleDateString()}
					</span>
				</div>

				<div class="ml-auto whitespace-nowrap mt-1 text-sm">
					{(checkout.amount / 100).toFixed(2)}
					{checkout.currency?.toUpperCase()}
				</div>
			</div>

			<div class="flex flex-col mt-2 gap-2">
				{#each checkout.products as product}
					<div class="flex gap-2">
						<div>{product.name}</div>
						{#if product.event}
							<div>
								Utilisé sur <span class="bold">{product.event.name}</span>
							</div>
						{:else}
							<div>Non utilisé</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{:else}
		<Placeholder>
			<span>Tu n'as fait aucune achats</span>
		</Placeholder>
	{/each}
</div>

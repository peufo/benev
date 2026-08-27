<script lang="ts">
	import { PRICE_STANDARD, PRICE_PREMIUM, PRICE_STANDARD_TO_PREMIUM } from '$app/env/public'
	import { InputNumber } from 'fuma'
	import { createCheckout } from './checkout.remote'

	const products = [
		{ priceId: PRICE_STANDARD, name: 'Plan standard' },
		{ priceId: PRICE_PREMIUM, name: 'Plan premium' },
		{ priceId: PRICE_STANDARD_TO_PREMIUM, name: 'Plan premium (upgrade)' },
	]
</script>

<div class="border p-4 rounded grow">
	<h3 class="title text-base">Produits</h3>

	<div class="flex flex-col gap-3 mt-2">
		{#each products as product, index (product.priceId)}
			{@const prefix = `products[${index}]`}
			<div class="flex items-center gap-3">
				<input type="hidden" name="{prefix}.priceId" value={product.priceId} />
				<input type="hidden" name="{prefix}.name" value={product.name} />
				<span class="grow">{product.name}</span>
				<InputNumber
					field={createCheckout.fields.products[index].quantity}
					label="Qté"
					value={0}
					class="w-24"
				/>
			</div>
		{/each}
	</div>
</div>

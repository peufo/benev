<script lang="ts">
	import { InputSearch, Surface } from '$lib/ui'
	import { Pagination } from 'fuma'
	import ProductsTable from './ProductsTable.svelte'

	let { data } = $props()
</script>

<Surface title="Produits ({data.productsCount})" class="min-w-0 overflow-auto">
	{#snippet action()}
		<InputSearch />
	{/snippet}
	<ProductsTable products={data.products} />
	<div class="ml-auto">
		<Pagination />
	</div>
</Surface>

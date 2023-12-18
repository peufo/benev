<script lang="ts">
	export let data
</script>

<div class="max-w-lg mx-auto">

	<h2 class="text-xl font-semibold text-base-content/70">Facturation</h2>
	<div class="flex flex-col gap-2">

		{#each data.checkouts as checkout}
			<section class="border rounded p-4 pt-2">
				<div class="flex gap-2 items-top">
					<div class="flex flex-wrap gap-x-2 gap-y-0 items-center">
						<h3 class="font-semibold opacity-80">{checkout.createdAt.toLocaleDateString()}</h3>
						<span class="text-xs italic opacity-70">
							{checkout.createdAt.toLocaleDateString()}
						</span>
					</div>

				
						<div class="badge badge-warning badge-outline ml-auto whitespace-nowrap mt-1">
							DATE, montant ?
						</div>
	
				</div>
				<p class="text-sm opacity-90 mt-2">Contenu</p>
			</section>
		{/each}
	</div>

</div>

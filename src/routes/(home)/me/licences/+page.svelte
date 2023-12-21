<script lang="ts">
	import { Card, Icon } from '$lib/material'
	import { mdiPlus } from '@mdi/js'
	import { licencesLabel } from '$lib/validation'

	export let data
</script>

<div class="max-w-lg mx-auto">
	<Card returnUrl="/me">
		<div slot="title">Mes licences</div>
		<a slot="action" href="/me/licences/checkout" class="btn btn-square">
			<Icon path={mdiPlus} title="Acheter de nouvelles licences" />
		</a>

		<div class="flex gap-2 justify-end mb-2">
			{#if data.licences.event}
				<span class="badge badge-lg badge-primary gap-1">
					<b>{data.licences.event}</b> Évènements
				</span>
			{/if}
			{#if data.licences.member}
				<span class="badge badge-lg badge-primary gap-1">
					<b>{data.licences.member}</b>
					Membres
				</span>
			{/if}
		</div>

		<div class="flex flex-col gap-2">
			{#each data.checkouts as checkout}
				<section class="border rounded p-4 pt-2">
					<div class="flex gap-2 items-top">
						<div class="flex flex-wrap gap-x-2 gap-y-0 items-center">
							<h3 class="font-semibold opacity-80">Achat</h3>
							<span class="text-xs italic opacity-70">
								{checkout.createdAt.toLocaleDateString()}
							</span>
						</div>

						<div class="ml-auto whitespace-nowrap mt-1 text-sm">
							{(checkout.amount / 100).toFixed(2)}
							{checkout.currency.toUpperCase()}
						</div>
					</div>

					<div class="flex mt-2 gap-2 justify-end">
						{#each checkout.licences as licence}
							<span class="badge gap-1 badge-success">
								<b>+{licence.quantity}</b>
								{licencesLabel[licence.type]}{licence.quantity > 1 ? 's' : ''}
							</span>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	</Card>
</div>

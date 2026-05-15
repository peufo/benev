<script lang="ts">
	import { mdiPlus } from '@mdi/js'
	import { Icon, Placeholder } from 'fuma'
	import { page } from '$app/stores'
	import { CheckoutWaitSSE } from '$lib/checkout'
	import { LICENCE_TYPE_LABEL } from '$lib/constant/index.js'

	export let data

	const checkouts = data.checkouts.map((c) => ({
		...c,
		// Just for legacy information
		licencesMember:
			data.licences.find((l) => l.type === 'member' && l.checkoutId === c.id)?._count._all || 0,
		licencesEvent:
			data.licences.find((l) => l.type === 'event' && l.checkoutId === c.id)?._count._all || 0,
	}))

	const checkoutId = $page.url.searchParams.get('checkoutId')
</script>

<div class="flex items-center">
	<div class="title">Mes donations</div>

	<a href="/me/donations/checkout" class="btn ml-auto" data-sveltekit-preload-data="off">
		<Icon path={mdiPlus} title="Soutenir Benevio en faisant un don" />
		Nouvelle donation
	</a>
</div>

<div class="flex flex-col gap-2">
	<CheckoutWaitSSE
		allreadyLoaded={(checkoutId) => !!data.checkouts.find(({ id }) => id === checkoutId)}
		eventSource="/me/donations/validation"
	/>

	{#each checkouts as checkout}
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

			<div class="flex mt-2 gap-2 justify-end">
				{#if checkout.licencesEvent !== 0}
					<span
						class="badge gap-1"
						class:badge-success={checkout.licencesEvent > 0}
						class:badge-warning={checkout.licencesEvent < 0}
					>
						{LICENCE_TYPE_LABEL.event}
						<b>
							{checkout.licencesEvent > 0 ? '+' : ''}
							{checkout.licencesEvent}
						</b>
					</span>
				{/if}

				{#if checkout.licencesMember !== 0}
					<span
						class="badge gap-1"
						class:badge-success={checkout.licencesMember > 0}
						class:badge-warning={checkout.licencesMember < 0}
					>
						{LICENCE_TYPE_LABEL.member}
						<b>
							{checkout.licencesMember > 0 ? '+' : ''}
							{checkout.licencesMember}
						</b>
					</span>
				{/if}
			</div>
		</section>
	{:else}
		<Placeholder>
			<span>Tu n'as fait aucune donations</span>
		</Placeholder>
	{/each}
</div>

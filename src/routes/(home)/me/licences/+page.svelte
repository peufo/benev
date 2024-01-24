<script lang="ts">
	import { mdiPlus } from '@mdi/js'

	import { Icon, Placeholder } from '$lib/material'
	import { LICENCE_TYPE_LABEL } from '$lib/constant'
	import type { PageData } from './$types.js'
	import { page } from '$app/stores'
	import { CheckoutWaitSSE } from '$lib/checkout'

	export let data

	type Transaction = {
		id: string
		name: string
		date: Date
		licencesEvent: number
		licencesMember: number
		amount?: number
		currency?: string
	}
	$: licences = data.checkouts.map((checkout) => checkout.licences).flat()
	$: transactions = getTransactions(data)

	function getTransactions(data: PageData): Transaction[] {
		return [
			...data.checkouts.map((checkout) => ({
				id: checkout.id,
				name: checkout.name || 'Achat de licences',
				date: checkout.createdAt,
				licencesEvent: checkout.licences.filter((l) => l.type === 'event').length,
				licencesMember: checkout.licences.filter((l) => l.type === 'member').length,
				amount: checkout.amount,
				currency: checkout.currency,
			})),
			...data.events.map((event) => ({
				id: event.id,
				name: `Évènement: ${event.name}`,
				date: event.updatedAt,
				licencesEvent: -1,
				licencesMember: -event._count.members,
			})),
		].toSorted((a, b) => b.date.getTime() - a.date.getTime())
	}

	let checkoutId = $page.url.searchParams.get('checkoutId')
</script>

<div class="flex items-center">
	<div class="title">Mes licences</div>

	<a href="/me/licences/checkout" class="btn ml-auto" data-sveltekit-preload-data="off">
		<Icon path={mdiPlus} title="Obtenir de nouvelles licences" />
		Obtenir
	</a>
</div>

<div class="flex gap-2 mb-2">
	<span class="badge badge-lg badge-primary badge-outline gap-1">
		{LICENCE_TYPE_LABEL.event}
		<b>{licences.filter((l) => !l.eventId && l.type === 'event').length}</b>
	</span>

	<span class="badge badge-lg badge-primary badge-outline gap-1">
		{LICENCE_TYPE_LABEL.member}
		<b>{licences.filter((l) => !l.memberId && l.type === 'member').length}</b>
	</span>
</div>

<div class="flex flex-col gap-2">
	<CheckoutWaitSSE
		allreadyLoaded={(checkoutId) => !!data.checkouts.find(({ id }) => id === checkoutId)}
	/>

	{#each transactions as tr}
		<section
			class="border rounded p-4 pt-2"
			class:border-primary={tr.id === checkoutId}
			class:border-2={tr.id === checkoutId}
		>
			<div class="flex gap-2 items-top">
				<div class="flex flex-wrap gap-x-2 gap-y-0 items-center">
					<h3 class="font-semibold opacity-80">{tr.name || ''}</h3>
					<span class="text-xs italic opacity-70">
						{tr.date.toLocaleDateString()}
					</span>
				</div>

				{#if tr.amount && tr.currency}
					<div class="ml-auto whitespace-nowrap mt-1 text-sm">
						{(tr.amount / 100).toFixed(2)}
						{tr.currency.toUpperCase()}
					</div>
				{/if}
			</div>

			<div class="flex mt-2 gap-2 justify-end">
				{#if tr.licencesEvent !== 0}
					<span
						class="badge gap-1"
						class:badge-success={tr.licencesEvent > 0}
						class:badge-warning={tr.licencesEvent < 0}
					>
						{LICENCE_TYPE_LABEL.event}
						<b
							>{tr.licencesEvent > 0 ? '+' : ''}
							{tr.licencesEvent}
						</b>
					</span>
				{/if}

				{#if tr.licencesMember !== 0}
					<span
						class="badge gap-1"
						class:badge-success={tr.licencesMember > 0}
						class:badge-warning={tr.licencesMember < 0}
					>
						{LICENCE_TYPE_LABEL.member}
						<b
							>{tr.licencesMember > 0 ? '+' : ''}
							{tr.licencesMember}
						</b>
					</span>
				{/if}
			</div>
		</section>
	{:else}
		<Placeholder>
			<span>Tu n'as pas de licences organisateur</span>
		</Placeholder>
	{/each}
</div>

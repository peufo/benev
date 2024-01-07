<script lang="ts">
	import { onMount } from 'svelte'
	import { mdiPlus } from '@mdi/js'
	import { invalidateAll } from '$app/navigation'
	import { Icon, Placeholder } from '$lib/material'
	import { LICENCE } from '$lib/constant'

	export let data

	let checkoutSessionId: string | null = null

	onMount(() => {
		const searchParams = new URLSearchParams(location.search)
		checkoutSessionId = searchParams.get('checkoutSessionId')
		if (!checkoutSessionId) return
		const checkout = data.checkouts.find((checkout) => checkout.id === checkoutSessionId)
		if (!checkout) invalidateAll()
	})
</script>

<div class="flex items-center">
	<div class="title">Mes licences</div>

	<a href="/me/licences/checkout" class="btn ml-auto" data-sveltekit-preload-data="off">
		<Icon path={mdiPlus} title="Obtenir de nouvelles licences" />
		Obtenir
	</a>
</div>

<div class="flex gap-2 mb-2">
	{#if data.licences.event}
		<span class="badge badge-lg badge-primary badge-outline gap-1">
			<b>{data.licences.event}</b> Évènements
		</span>
	{/if}
	{#if data.licences.member}
		<span class="badge badge-lg badge-primary badge-outline gap-1">
			<b>{data.licences.member}</b>
			Membres
		</span>
	{/if}
</div>

<div class="flex flex-col gap-2">
	{#each data.checkouts as checkout}
		<section
			class="border rounded p-4 pt-2"
			class:border-primary={checkout.id === checkoutSessionId}
			class:border-2={checkout.id === checkoutSessionId}
		>
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
						{LICENCE[licence.type]}{licence.quantity > 1 ? 's' : ''}
					</span>
				{/each}
			</div>
		</section>
	{:else}
		<Placeholder>
			<span>Tu n'as pas de licences organisateur</span>
		</Placeholder>
	{/each}
</div>

<script lang="ts">
	import { onMount } from 'svelte'
	import { mdiPlus } from '@mdi/js'
	import { invalidateAll } from '$app/navigation'
	import { Icon, Placeholder } from '$lib/material'
	import { LICENCE_TYPE_LABEL } from '$lib/constant'

	export let data

	let checkoutSessionId: string | null = null

	const licences = data.checkouts.map((checkout) => checkout.licences).flat()

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
	{#each data.checkouts as checkout}
		{@const licencesEvent = checkout.licences.filter((l) => l.type === 'event')}
		{@const licencesMember = checkout.licences.filter((l) => l.type === 'member')}

		<section
			class="border rounded p-4 pt-2"
			class:border-primary={checkout.id === checkoutSessionId}
			class:border-2={checkout.id === checkoutSessionId}
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
					{checkout.currency.toUpperCase()}
				</div>
			</div>

			<div class="flex mt-2 gap-2 justify-end">
				{#if licencesEvent.length}
					<span class="badge gap-1 badge-success">
						{LICENCE_TYPE_LABEL.event}
						<b>+{licencesEvent.length}</b>
					</span>
				{/if}

				{#if licencesMember.length}
					<span class="badge gap-1 badge-success">
						{LICENCE_TYPE_LABEL.member}
						<b>+{licencesMember.length}</b>
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

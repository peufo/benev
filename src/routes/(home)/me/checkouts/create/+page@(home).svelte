<script lang="ts">
	import { onMount } from 'svelte'
	import { loadStripe } from '@stripe/stripe-js'
	import env from '$app/env/public'
	import { Card } from '$lib/ui'

	let { data } = $props()

	let checkoutElement: HTMLDivElement = $state()!
	let destroy: () => void = () => {}
	let isLoading = $state(true)

	async function initCheckout() {
		try {
			const stripe = await loadStripe(env.STRIPE_KEY)
			if (!stripe) throw 'stripe is not defined'
			const checkout = await stripe.initEmbeddedCheckout({ clientSecret: data.clientSecret })
			isLoading = false
			checkout.mount(checkoutElement)
			destroy = () => checkout.destroy()
		} catch (error) {
			console.error(error)
		}
	}

	onMount(() => {
		initCheckout()
		return destroy
	})
</script>

<Card class="max-w-265 mx-auto">
	{#if isLoading}
		<div class="h-150 grid place-content-center">
			<span class="loading loading-ring loading-lg"></span>
		</div>
	{/if}
	<div bind:this={checkoutElement}></div>
</Card>

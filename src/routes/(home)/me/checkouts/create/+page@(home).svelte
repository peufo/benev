<script lang="ts">
	import { onMount } from 'svelte'
	import { loadStripe } from '@stripe/stripe-js'
	import { env } from '$env/dynamic/public'
	import { Card } from '$lib/fuma'

	let { data } = $props()

	let checkoutElement: HTMLDivElement = $state()
	let destroy: () => void = () => {}
	let isLoading = $state(true)

	async function initCheckout() {
		try {
			const stripe = await loadStripe(env.PUBLIC_STRIPE_KEY)
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

<Card class="max-w-[1060px] mx-auto">
	{#if isLoading}
		<div class="h-[600px] grid place-content-center">
			<span class="loading loading-ring loading-lg"></span>
		</div>
	{/if}
	<div bind:this={checkoutElement}></div>
</Card>

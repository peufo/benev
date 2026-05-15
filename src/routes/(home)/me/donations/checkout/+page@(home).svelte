<script lang="ts">
	import { onMount } from 'svelte'
	import { loadStripe } from '@stripe/stripe-js'
	import { env } from '$env/dynamic/public'
	import { Card } from 'fuma'

	export let data

	let checkoutElement: HTMLDivElement
	let destroy: () => void = () => {}
	let isLoading = true

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
	<h2 slot="title" class="text-center mb-6">Merci pour ton soutien ❤️</h2>
	{#if isLoading}
		<div class="h-[600px] grid place-content-center">
			<span class="loading loading-ring loading-lg" />
		</div>
	{/if}
	<div bind:this={checkoutElement} />
</Card>

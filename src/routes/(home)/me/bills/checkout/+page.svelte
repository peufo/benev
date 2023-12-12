<script lang="ts">
	import { onMount } from 'svelte'
	import axios from 'axios'
	import { loadStripe } from '@stripe/stripe-js'
	import { PUBLIC_STRIPE_KEY } from '$env/static/public'
	import Card from '$lib/material/Card.svelte'

	let checkoutElement: HTMLDivElement

	onMount(async () => {
		const stripe = await loadStripe(PUBLIC_STRIPE_KEY)
		try {
			const { data } = await axios.post<{ clientSecret: string }>('/me/bills/checkout/create')
			if (!stripe) return new Promise(() => {})

			const checkout = await stripe.initEmbeddedCheckout(data)
			checkout.mount(checkoutElement)
			return () => {
				checkout.destroy()
			}
		} catch (error) {
			console.log(error)
		}
	})
</script>

<Card class="max-w-[1060px] mx-auto">
	<div bind:this={checkoutElement} />
</Card>

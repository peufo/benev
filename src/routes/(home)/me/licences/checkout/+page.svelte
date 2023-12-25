<script lang="ts">
	import { onMount } from 'svelte'
	import axios from 'axios'
	import { loadStripe } from '@stripe/stripe-js'
	import { PUBLIC_STRIPE_KEY } from '$env/static/public'
	import Card from '$lib/material/Card.svelte'

	let checkoutElement: HTMLDivElement

	let destroy: () => void = () => {}
	async function initCheckout() {
		try {
			const stripe = await loadStripe(PUBLIC_STRIPE_KEY)
			if (!stripe) throw 'stripe is not defined'
			const { data } = await axios.post<{ clientSecret: string }>('/me/licences/checkout/create')
			const checkout = await stripe.initEmbeddedCheckout(data)
			checkout.mount(checkoutElement)
			destroy = () => checkout.destroy()
		} catch (error) {
			console.log(error)
		}
	}

	onMount(() => {
		initCheckout()
		return destroy
	})
</script>

<Card class="max-w-[1060px] mx-auto">
	<div bind:this={checkoutElement} />
</Card>

<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { urlParam } from '$lib/store'
	import { onMount } from 'svelte'

	export let allreadyLoaded: (checkoutId: string) => boolean = () => false
	export let removeCheckoutId = false

	let checkoutId = $page.url.searchParams.get('checkoutId')
	let isNewCheckoutAwaited = !!checkoutId && !allreadyLoaded(checkoutId)

	const handleCheckoutNotification = async () => {
		isNewCheckoutAwaited = false
		if (!removeCheckoutId) invalidateAll()
		else goto($urlParam.without('checkoutId'), { noScroll: true, invalidateAll: true })
	}

	function awaitCheckoutNotification() {
		if (!checkoutId) return
		if (!isNewCheckoutAwaited) return

		const timeout = setTimeout(handleCheckoutNotification, 5000)
		const subscription = new EventSource(`/me/licences/checkout/validation${location.search}`)
		subscription.addEventListener(checkoutId, handleCheckoutNotification)

		return () => {
			clearTimeout(timeout)
			if (checkoutId) subscription.removeEventListener(checkoutId, handleCheckoutNotification)
		}
	}

	onMount(awaitCheckoutNotification)
</script>

{#if isNewCheckoutAwaited}
	<div class="h-20 grid place-content-center border-primary border rounded">
		<span class="loading loading-infinity loading-lg text-primary" />
	</div>
{/if}

<script lang="ts">
	import { onMount, untrack } from 'svelte'
	import { urlParam } from 'fuma'
	import { invalidateAll, goto } from '$app/navigation'
	import { page } from '$app/stores'

	interface Props {
		allreadyLoaded?: (checkoutId: string) => boolean
		removeCheckoutId?: boolean
		eventSource?: string
	}

	let {
		allreadyLoaded = () => false,
		removeCheckoutId = false,
		eventSource = '/me/checkouts/validation',
	}: Props = $props()

	let checkoutId = $page.url.searchParams.get('checkoutId')
	// État d'attente amorcé au montage puis piloté par la notification SSE.
	let isNewCheckoutAwaited = $state(!!checkoutId && !untrack(() => allreadyLoaded)(checkoutId))

	const handleCheckoutNotification = async () => {
		isNewCheckoutAwaited = false
		if (!removeCheckoutId) invalidateAll()
		else goto(urlParam.without('checkoutId'), { noScroll: true, invalidateAll: true })
	}

	function awaitCheckoutNotification() {
		if (!checkoutId) return
		if (!isNewCheckoutAwaited) return

		const timeout = setTimeout(handleCheckoutNotification, 5000)
		const subscription = new EventSource(`${eventSource}${location.search}`)
		subscription.addEventListener(checkoutId, handleCheckoutNotification)

		return () => {
			clearTimeout(timeout)
			if (checkoutId) subscription.removeEventListener(checkoutId, handleCheckoutNotification)
		}
	}

	onMount(awaitCheckoutNotification)
</script>

<!-- TODO: utilisé un toast à la place -->
{#if isNewCheckoutAwaited}
	<div class="h-20 grid place-content-center border-primary border rounded">
		<span class="loading loading-infinity loading-lg text-primary"></span>
	</div>
{/if}

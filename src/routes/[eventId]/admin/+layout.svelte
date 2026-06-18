<script lang="ts">
	import { CheckoutWaitSSE } from '$lib/checkout'
</script>

<div class="flex flex-col gap-4">
	<CheckoutWaitSSE removeCheckoutId />

	<slot />
</div>

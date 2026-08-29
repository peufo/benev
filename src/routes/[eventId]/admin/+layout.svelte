<script lang="ts">
	import { CheckoutWaitSSE } from '$lib/checkout'
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()
</script>

<CheckoutWaitSSE removeCheckoutId />
<div class="mb-1 footer-hidden">
	{@render children?.()}
</div>

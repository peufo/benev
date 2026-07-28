<script lang="ts">
	import { CheckoutWaitSSE } from '$lib/checkout'
	interface Props {
		children?: import('svelte').Snippet
	}

	let { children }: Props = $props()
</script>

<div class="flex flex-col gap-4">
	<CheckoutWaitSSE removeCheckoutId />

	{@render children?.()}
</div>

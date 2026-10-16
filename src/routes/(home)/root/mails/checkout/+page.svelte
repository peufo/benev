<script lang="ts">
	import { Placeholder } from '#lib/ui/index.js'
	import { EmailCheckoutValidation } from '#lib/email/index.js'

	let { data } = $props()
</script>

{#if data.checkout}
	<EmailCheckoutValidation checkout={data.checkout} />
	<hr />
	<EmailCheckoutValidation checkout={data.checkout} dest="root" />
{:else}
	<Placeholder>Pas de checkout</Placeholder>
{/if}

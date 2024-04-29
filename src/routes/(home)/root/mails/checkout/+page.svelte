<script lang="ts">
	import { Placeholder } from 'fuma'
	import { EmailCheckoutValidation } from '$lib/email'

	export let data
</script>

{#if data.checkout}
	<EmailCheckoutValidation checkout={data.checkout} />
	<hr />
	<EmailCheckoutValidation checkout={data.checkout} dest="root" />
{:else}
	<Placeholder>Pas de checkout</Placeholder>
{/if}

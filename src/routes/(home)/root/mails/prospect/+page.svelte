<script lang="ts">
	import { EmailProspect } from '$lib/email'

	export let data
</script>

{#if data.prospect}
	<EmailProspect prospect={data.prospect} />
{:else}
	<p>Pas de prospect dans la DB.</p>
{/if}

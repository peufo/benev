<script lang="ts">
	import Login from './Login.svelte'

	export let data
</script>

{#if !data.user}
	<Login />
{:else}
	Redirection en cours
{/if}

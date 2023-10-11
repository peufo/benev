<script lang="ts">
	export let data
</script>

<svelte:head>
	<title>Gestion - {data.event.name}</title>
</svelte:head>

<div class="flex flex-col gap-4 max-w-4xl m-auto">
	<slot />
</div>

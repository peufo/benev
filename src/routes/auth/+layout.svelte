<script lang="ts">
  import Header from "$lib/Header.svelte"
  export let data
</script>

<div class="p-2" >
	<Header userName={data.user?.name}/>
</div>

<main class="grow p-2">
  <slot/>
</main>
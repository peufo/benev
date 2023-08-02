<script lang="ts">
	import { mdiChevronRight } from "@mdi/js"
  import Header from "$lib/Header.svelte"
	import { Icon } from "$lib/material"

  export let data
</script>

<div class="p-2" >
	<Header>
    <button class="btn btn-ghost text-xl pl-0">

      <Icon path={mdiChevronRight} />
      {data.event.name}
    </button>
  </Header>
</div>

<main class="grow p-2">
  <slot/>
</main>
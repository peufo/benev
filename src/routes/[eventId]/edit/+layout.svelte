<script lang="ts">
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'

	const tabs = [
		['/edit', "L'évenement"],
		['/edit/pages', 'Les pages'],
	]
</script>

<div class="grid place-content-center">
  <div class="card bg-base-100 min-w-[500px]">
    <div class="tabs">
      {#each tabs as [path, label]}
        {@const href = `${$eventPath}${path}`}
        <a {href} class="tab tab-lg tab-lifted" class:tab-active={$page.url.pathname.endsWith(path)}>
          {label}
        </a>
      {/each}
    </div>
    <div class="card-body">
      <slot />
    </div>
  </div>
</div>

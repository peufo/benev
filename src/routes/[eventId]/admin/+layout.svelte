<script lang="ts">
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'

	const tabs = [
		{ path: '/admin', label: "L'évenement", reg: /\/admin$/ },
		{ path: '/admin/pages', label: 'Les pages', reg: /\/admin\/pages*/ },
		{ path: '/admin/users', label: 'Les bénévoles', reg: /\/admin\/users/ },
	]
</script>

<svelte:head>
	<title>BENEV - Administration</title>
</svelte:head>


<div class="flex gap-4 items-start flex-wrap justify-center">

  <ul class="menu menu-lg bg-base-100 rounded-box text-clip">
    {#each tabs as { path, label, reg }}
			{@const href = `${$eventPath}${path}`}
      <li>
        <a {href} class:active={$page.url.pathname.match(reg)}>
          {label}
        </a>
      </li>
    {/each}
  </ul>

  <div class="card bg-base-100 max-w-4xl" style="width: -webkit-fill-available;">
    <div class="card-body">
      <slot />
    </div>
  </div>

</div>

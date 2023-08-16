<script lang="ts">
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'

	const tabs = [
		{ path: '/admin', label: 'Les bénévoles', reg: /\/admin(\/users.*)?$/ },
		{ path: '/admin/leaders', label: 'Les responsables', reg: /\/admin\/leaders/ },
		{ path: '/admin/config', label: 'Configuration', reg: /\/admin\/config/ },
		{ path: '/admin/pages', label: 'Les pages', reg: /\/admin\/pages.*/ },
	]
</script>

<svelte:head>
	<title>BENEV - Administration</title>
</svelte:head>

<div class="flex flex-col gap-4 max-w-4xl m-auto">
	<div class="tabs tabs-boxed bg-base-100 grid grid-cols-1 sm:grid-cols-4 shadow-lg">
		{#each tabs as { path, label, reg }}
			{@const href = `${$eventPath}${path}`}

			<a
				class="tab tab-lg whitespace-nowrap"
				{href}
				class:tab-active={$page.url.pathname.match(reg)}
			>
				{label}
			</a>
		{/each}
	</div>

	<slot />
</div>

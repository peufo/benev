<script lang="ts">
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'

	const tabs = [
		{ path: '/admin', label: "L'évenement", reg: /\/admin$/ },
		{ path: '/admin/pages', label: 'Les pages', reg: /\/admin\/pages*/ },
	]
</script>

<svelte:head>
	<title>BENEV - Édition</title>
</svelte:head>

<div class="grid place-content-center">
	<div class="card bg-base-100 min-w-[500px]">
		<div class="tabs">
			{#each tabs as { path, label, reg }}
				{@const href = `${$eventPath}${path}`}
				<a {href} class="tab tab-lg tab-lifted" class:tab-active={$page.url.pathname.match(reg)}>
					{label}
				</a>
			{/each}
		</div>
		<div class="card-body">
			<slot />
		</div>
	</div>
</div>

<script lang="ts">
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'

	const tabs = [
		{ path: '/admin', label: 'Les bénévoles', reg: /\/admin(\/users.*)?$/ },
		{ path: '/admin/leaders', label: 'Les responsables', reg: /\/admin\/leaders/ },
		{ path: '/admin/event', label: "L'évènement", reg: /\/admin\/event/ },
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

	<div class="card bg-base-100 shadow-lg">
		<div class="card-body p-2 sm:p-8">
			<slot />
		</div>
	</div>
</div>

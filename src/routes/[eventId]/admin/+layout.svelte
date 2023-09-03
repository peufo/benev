<script lang="ts">
	import {
		mdiAccountGroupOutline,
		mdiApplicationCogOutline,
		mdiChartGantt,
		mdiFileDocumentMultipleOutline,
	} from '@mdi/js'
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { Icon } from '$lib/material'

	const tabs = [
		{
			path: '/admin',
			label: 'Les membres',
			icon: mdiAccountGroupOutline,
			reg: /\/admin(\/members.*)?$/,
		},
		{
			path: '/admin/plan',
			label: 'planification',
			icon: mdiChartGantt,
			reg: /\/admin\/plan/,
		},
		{
			path: '/admin/config',
			label: 'Configuration',
			icon: mdiApplicationCogOutline,
			reg: /\/admin\/config/,
		},
		{
			path: '/admin/pages',
			label: 'Les pages',
			icon: mdiFileDocumentMultipleOutline,
			reg: /\/admin\/pages.*/,
		},
	]
</script>

<svelte:head>
	<title>BENEV - Administration</title>
</svelte:head>

<div class="flex flex-col gap-4 max-w-4xl m-auto">
	<div class="tabs tabs-boxed bg-base-100 grid grid-cols-1 md:grid-cols-4 shadow-lg">
		{#each tabs as { path, label, reg, icon }}
			{@const href = `${$eventPath}${path}`}
			{@const active = !!$page.url.pathname.match(reg)}
			<a
				class="tab tab-lg flex-nowrap grow justify-start md:justify-center"
				{href}
				class:tab-active={active}
			>
				<Icon path={icon} class="mr-3 opacity-70" size={22} {active} />
				<span>{label}</span>
			</a>
		{/each}
	</div>

	<slot />
</div>

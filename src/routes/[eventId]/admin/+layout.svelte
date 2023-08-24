<script lang="ts">
	import {
		mdiAccountGroupOutline,
		mdiApplicationCogOutline,
		mdiFileDocumentMultipleOutline,
	} from '@mdi/js'
	import { page } from '$app/stores'
	import { eventPath } from '$lib/store'
	import { Icon } from '$lib/material'

	const tabs = [
		{
			path: '/admin',
			label: 'Les bénévoles',
			icon: mdiAccountGroupOutline,
			reg: /\/admin(\/members.*)?$/,
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
	<div class="tabs tabs-boxed bg-base-100 grid grid-cols-1 sm:grid-cols-3 shadow-lg">
		{#each tabs as { path, label, reg, icon }}
			{@const href = `${$eventPath}${path}`}
			{@const active = !!$page.url.pathname.match(reg)}
			<a
				class="tab tab-lg flex-nowrap grow"
				{href}
				class:tab-active={active}
			>
				<Icon path={icon} class="mr-3 opacity-70" size={22} {active}/>
				<span>{label}</span>
			</a>
		{/each}
	</div>

	<slot />
</div>

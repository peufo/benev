<script lang="ts">
	import { page } from '$app/stores'
	import { Card, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { adminTabs } from './adminTabs'

	export let data

	$: activeTab = adminTabs.find((tab) => $page.route.id?.startsWith(`/[eventId]${tab.path}`))
</script>

<svelte:head>
	<title>Gestion - {data.event.name}</title>
</svelte:head>

<div class="flex flex-col gap-4 max-w-5xl m-auto">
	<Card>
		<div slot="top" class="contents">
			<div class="flex gap-1 mb-1 border rounded-md">
				{#each adminTabs as { path, label, icon }}
					{@const active = path === activeTab?.path}
					<a
						href="{$eventPath}{path}"
						class="menu-item grow justify-center flex-col gap-0 text-sm py-2 lg:flex-row lg:text-base lg:gap-2"
						class:active
					>
						<Icon path={icon} size={20} class="opacity-70" {active} />
						<span class="whitespace-nowrap hidden sm:block">{label}</span>
					</a>
				{/each}
			</div>

			<h2 class="sm:hidden text-lg font-medium mb-1">
				{activeTab?.label}
			</h2>
		</div>

		<slot />
	</Card>
</div>

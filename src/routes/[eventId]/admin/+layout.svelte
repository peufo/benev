<script lang="ts">
	import { page } from '$app/stores'
	import { Card, Icon } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { adminTabs } from './adminTabs'

	export let data

	$: activeTab = $adminTabs.find((tab) => $page.route.id?.startsWith(`/[eventId]${tab.path}`))
</script>

<svelte:head>
	<title>Gestion - {data.event.name}</title>
</svelte:head>

<div class="flex flex-col gap-4 max-w-5xl m-auto">
	<Card bodyClass="sm:pt-4">
		<div
			slot="top"
			class="sticky top-0 bg-base-100 shadow-sm z-10 flex gap-2 p-2 border-b bordered rounded-t-2xl"
		>
			{#each $adminTabs as { path, query, label, icon }}
				{@const active = path === activeTab?.path}
				<a
					href="{$eventPath}{path}{query}"
					class="
							menu-item grow justify-center flex-col gap-0 text-sm py-2
							lg:flex-row lg:text-base lg:gap-3 rounded-lg
						"
					class:active
				>
					<Icon path={icon} size={20} class="opacity-70" {active} />
					<span class="whitespace-nowrap hidden sm:block">{label}</span>
				</a>
			{/each}
		</div>

		<h2 slot="title" class="sm:hidden text-center pb-2">
			{activeTab?.label}
		</h2>

		<slot />
	</Card>
</div>

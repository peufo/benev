<script lang="ts">
	import { Card, Icon } from '$lib/material'
	import { adminTabs } from './adminTabs'

	export let data

	$: activeTab = $adminTabs.find(({ isActive }) => isActive)
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
			{#each $adminTabs as { href, label, icon, isActive }}
				<a
					{href}
					class="
							menu-item grow justify-center flex-col gap-0 text-sm py-2
							lg:flex-row lg:text-base lg:gap-3 rounded-lg
						"
					class:active={isActive}
				>
					<Icon path={icon} size={20} class="opacity-70" active={isActive} />
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

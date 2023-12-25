<script lang="ts">
	import { Card, Icon, Tabs } from '$lib/material'
	import { adminTabs } from './adminTabs'

	export let data

	$: activeTab = $adminTabs.find(({ isActive }) => isActive)
</script>

<svelte:head>
	<title>Gestion - {data.event.name}</title>
</svelte:head>

<div class="flex flex-col gap-4 max-w-5xl m-auto">
	<Card bodyClass="sm:pt-4">
		<svelte:fragment slot="top">
			<Tabs tabs={$adminTabs} />
		</svelte:fragment>

		<h2 slot="title" class="sm:hidden text-center pb-2">
			{activeTab?.label}
		</h2>

		<slot />
	</Card>
</div>

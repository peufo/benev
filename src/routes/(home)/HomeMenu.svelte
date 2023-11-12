<script lang="ts">
	import { Page } from '@prisma/client'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { Icon } from '$lib/material'
	import { mdiMenu } from '@mdi/js'
	import DropDown from '$lib/material/DropDown.svelte'

	const tabs: { path: string; label: string }[] = [{ path: '/terms', label: 'Conditions' }]
</script>

<div class="gap-2 hidden lg:flex">
	{#each tabs as { path, label }}
		{@const active = $page.route.id?.startsWith(`/[eventId]${path}`)}
		<a href="{$eventPath}{path}" class="menu-item" class:active>
			{label}
		</a>
	{/each}
</div>

<DropDown class="max-h-none min-w-[200px]" hideOnBlur>
	<button slot="activator" class="btn btn-square ml-2 lg:hidden">
		<Icon path={mdiMenu} />
	</button>

	<div class="flex flex-col gap-1">
		{#each tabs as { path, label }}
			{@const active = $page.route.id?.startsWith(`/[eventId]${path}`)}
			<a href="{$eventPath}{path}" class="menu-item" class:active>
				{label}
			</a>
		{/each}
	</div>
</DropDown>

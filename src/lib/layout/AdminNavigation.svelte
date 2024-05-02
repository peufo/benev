<script lang="ts">
	import { drawerOpen } from '$lib/layout/store'
	import { adminTabs } from '$lib/layout/adminTabs'
	import { Icon } from 'fuma'
</script>

{#if $drawerOpen}
	<div class="sticky top-2 rounded-2xl bg-base-100 shadow-xl p-2 min-w-[220px] hidden lg:block">
		<h3 class="title-sm pl-3 py-2">Gestion</h3>

		<div class="flex flex-col gap-1 text-sm">
			{#each $adminTabs as { href, isActive, label, icon }, index}
				{#if index === 4}
					<h3 class="title-sm pl-3 py-2">Configuration</h3>
				{/if}

				<a {href} class="menu-item" class:active={isActive}>
					<Icon path={icon} size={20} class="opacity-70 py-1" />
					{label}
				</a>
			{/each}
		</div>
	</div>
{/if}

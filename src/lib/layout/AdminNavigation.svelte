<script lang="ts">
	import { drawerOpen } from '$lib/layout/store'
	import { adminTabs } from '$lib/layout/adminTabs'
	import { Card, Icon } from 'fuma'
</script>

{#if $drawerOpen}
	<Card class="sticky top-20 min-w-[220px] hidden lg:block" bodyClass="sm:px-2 sm:py-2">
		<div class="flex flex-col gap-1 text-sm">
			{#each $adminTabs as { href, isActive, label, icon }}
				<a {href} class="menu-item hover:bg-base-200/80" class:active={isActive}>
					<Icon path={icon} size={20} class="opacity-70 py-1" />
					{label}
				</a>
			{/each}
		</div>
	</Card>
{/if}

<script lang="ts">
	import { adminTabs } from '$lib/layout/adminTabs'
	import { Card } from 'fuma'
</script>

<Card
	class="max-w-[60px] hover:max-w-[300px] transition-[max-width] duration-300 overflow-hidden
		whitespace-nowrap shrink-0 group"
	bodyClass="sm:px-2 sm:py-2"
>
	<div class="flex flex-col gap-1 text-sm">
		{#each $adminTabs as { href, isActive, label, icon: Icon }}
			<a {href} class="menu-item hover:bg-base-200/80 overflow-hidden" class:active={isActive}>
				<span class="py-1">
					<Icon size={18} class="opacity-70" />
				</span>
				<span class="opacity-0 group-hover:opacity-100 transition-opacity">
					{label}
				</span>
			</a>
		{/each}
	</div>
</Card>

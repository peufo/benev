<script lang="ts">
	import { adminTabs } from '$lib/layout/adminTabs.svelte'
	import type { Snippet } from 'svelte'

	let { children }: { children?: Snippet } = $props()
</script>

<div
	class={[
		'surface',
		'max-w-13 hover:max-w-75 transition-[max-width] duration-300 overflow-hidden',
		'whitespace-nowrap shrink-0 group',
	]}
>
	<div class="flex flex-col gap-1 text-sm">
		{#each adminTabs() as { href, isActive, label, icon: Icon } (href)}
			<a {href} class="menu-item hover:bg-base-200/80 overflow-hidden" class:active={isActive}>
				<span class="py-1">
					<Icon size={18} class="opacity-70" />
				</span>
				<span class="opacity-0 group-hover:opacity-100 transition-opacity">
					{label}
				</span>
			</a>
		{/each}
		{@render children?.()}
	</div>
</div>

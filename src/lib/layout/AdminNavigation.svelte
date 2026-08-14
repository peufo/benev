<script lang="ts">
	import { adminTabs } from '$lib/layout/adminTabs.svelte'
	import { adminSubNav, scrollToSection } from '$lib/layout/adminSubNav.svelte'
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
		{#each adminTabs() as { href, isActive, label, icon: Icon, sections } (href)}
			<a {href} class="menu-item hover:bg-base-200/80 overflow-hidden" class:active={isActive}>
				<span class="py-1">
					<Icon size={18} class="opacity-70" />
				</span>
				<span class="opacity-0 group-hover:opacity-100 transition-opacity">
					{label}
				</span>
			</a>

			{#if isActive && sections}
				{@const activeId = adminSubNav.activeId || sections[0].id}
				<!-- Le rail replié ne laisse qu'une trentaine de pixels utiles: l'indentation qui
				     marque l'imbrication n'apparaît qu'une fois déplié, sinon elle rognerait
				     l'icône. -->
				{#each sections as section (section.id)}
					{@const SectionIcon = section.icon}
					<a
						href="#{section.id}"
						onclick={(event) => scrollToSection(event, section.id)}
						class="
							menu-item py-0.5 overflow-hidden text-xs
							group-hover:pl-8 transition-[padding] duration-300
						"
						class:active={activeId === section.id}
					>
						<span class="py-1">
							<SectionIcon size={15} class="opacity-60" />
						</span>
						<span class="opacity-0 group-hover:opacity-100 transition-opacity">
							{section.label}
						</span>
					</a>
				{/each}
			{/if}
		{/each}
		{@render children?.()}
	</div>
</div>

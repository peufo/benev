<script lang="ts">
	import { adminTabs } from '$lib/layout/adminTabs.svelte'
	import { adminSubNav, scrollToSection } from '$lib/layout/adminSubNav.svelte'
	import type { Snippet } from 'svelte'

	let { children }: { children?: Snippet } = $props()

	// Filet et indicateur partagent la même abscisse: repliée elle longe le bord, dépliée elle
	// tombe au centre de l'icône du parent, et suit l'indentation des sous-items au même rythme.
	const railX = 'left-1.5 group-hover:left-5 transition-[left] duration-300'
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
				     l'icône. Le filet, lui, tient dans les deux états et porte seul le lien de
				     parenté tant que le rail est replié. -->
				<div class="relative flex flex-col gap-1">
					<span class={['absolute inset-y-1 border-l border-soft', railX]} aria-hidden="true"
					></span>

					{#each sections as section (section.id)}
						{@const SectionIcon = section.icon}
						{@const isCurrent = activeId === section.id}
						<a
							href="#{section.id}"
							onclick={(event) => scrollToSection(event, section.id)}
							class={[
								'menu-item relative py-0.5 overflow-hidden text-xs',
								'group-hover:pl-8 transition-[padding] duration-300',
								isCurrent ? 'font-semibold' : 'text-base-content/70',
							]}
						>
							{#if isCurrent}
								<span
									class={['absolute inset-y-0.5 -ml-px w-0.5 rounded-full bg-primary', railX]}
									aria-hidden="true"
								></span>
							{/if}
							<span class="py-1">
								<SectionIcon size={15} />
							</span>
							<span class="opacity-0 group-hover:opacity-100 transition-opacity">
								{section.label}
							</span>
						</a>
					{/each}
				</div>
			{/if}
		{/each}
		{@render children?.()}
	</div>
</div>

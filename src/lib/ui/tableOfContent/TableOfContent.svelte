<script lang="ts">
	import type { ClassValue } from 'svelte/elements'
	import { scrollToSection, trackActiveSection, type TocSection } from './state.svelte.js'
	import type { Component } from 'svelte'
	import type { IconProps } from '@lucide/svelte'

	interface Props {
		/** Les sections de la page, dans leur ordre d'apparition. */
		sections: TocSection[]
		title?: string
		class?: ClassValue
		icon?: Component<IconProps>
	}

	let { sections, title = 'Sur cette page', class: klass, icon: Icon }: Props = $props()

	const toc = trackActiveSection(() => sections)
</script>

<!-- Le seuil et l'ancrage appartiennent au composant plutôt qu'à l'appelant: Tailwind ne résout
     pas les conflits de classes, une valeur passée en `class` ne les écraserait pas. -->
<nav
	class={[
		'surface sticky top-1 hidden w-52 shrink-0 self-start lg:block',
		// Un sommaire long ne doit pas déborder de l'écran une fois collé.
		'max-h-[calc(100dvh-1rem)] overflow-y-auto',
		klass,
	]}
	aria-label={title}
>
	<h2 class="title-sm px-3 pt-2 pb-1 flex gap-3 items-center">
		<Icon size={16} />
		<span>{title}</span>
	</h2>

	<ul class="flex flex-col text-sm">
		{#each sections as { id, label, icon: SectionIcon } (id)}
			{@const isCurrent = toc.activeId === id}
			<li>
				<a
					href="#{id}"
					onclick={(event) => scrollToSection(event, id)}
					class="menu-item py-1"
					class:active={isCurrent}
					aria-current={isCurrent ? 'true' : undefined}
				>
					{#if SectionIcon}
						<SectionIcon size={16} class="shrink-0 opacity-70" />
					{/if}
					<span class="truncate">{label}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>

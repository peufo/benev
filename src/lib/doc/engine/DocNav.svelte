<script lang="ts">
	import { ListIcon } from '@lucide/svelte'
	import { Drawer, urlParam } from 'fuma'
	import { scrollToSection, trackActiveSection, type TocSection } from '$lib/ui'
	import type { DocNavGroup } from './types'

	interface Props {
		groups: DocNavGroup[]
		/** Les chapitres de la page courante, dépliés sous son entrée. */
		sections?: TocSection[]
		/** Le slug de la page courante, ou rien sur l'accueil de la documentation. */
		slug?: string
	}

	let { groups, sections = [], slug }: Props = $props()

	// Un seul suivi pour les deux rendus: l'observateur regarde les chapitres de la page, pas la
	// navigation, et le sommaire du tiroir affiche donc le même chapitre actif que celui du côté.
	const toc = trackActiveSection(() => sections)

	const DRAWER_KEY = 'sommaire'
</script>

<!-- `close` n'est passé que par le tiroir. Les liens de page n'en ont pas besoin: leur `href` ne
     porte pas le paramètre, la navigation referme donc le tiroir d'elle-même. -->
{#snippet tree(close?: () => Promise<void>)}
	{#each groups as group (group.label)}
		<h3 class="title-sm px-3 pt-3 pb-1">{group.label}</h3>
		<ul class="flex flex-col gap-0.5">
			{#each group.pages as pageEntry (pageEntry.slug)}
				{@const isCurrent = pageEntry.slug === slug}
				<li>
					<a
						href={pageEntry.path}
						class="menu-item py-1.5 text-sm"
						class:active={isCurrent}
						aria-current={isCurrent ? 'page' : undefined}
					>
						<span class="truncate">{pageEntry.label}</span>
					</a>

					{#if isCurrent && sections.length}
						<ul class="border-soft mt-0.5 ml-4 flex flex-col gap-0.5 border-l pl-1">
							{#each sections as section (section.id)}
								{@const isActive = toc.activeId === section.id}
								<li>
									<a
										href="#{section.id}"
										class="menu-item py-1 text-sm"
										class:active={isActive}
										aria-current={isActive ? 'true' : undefined}
										onclick={async (event) => {
											// Le tiroir se referme par une navigation: défiler avant elle
											// reviendrait à lancer une animation qu'elle interromprait.
											event.preventDefault()
											await close?.()
											scrollToSection(event, section.id)
										}}
									>
										<span class="truncate">{section.label}</span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
				</li>
			{/each}
		</ul>
	{/each}
{/snippet}

<!-- Sous `lg`, le parent n'est pas encore une rangée: le déclencheur se pose au-dessus du contenu. -->
<a
	href={urlParam.with({ [DRAWER_KEY]: '1' })}
	class="btn btn-ghost mb-3 w-full justify-start lg:hidden"
	data-sveltekit-noscroll
	data-sveltekit-replacestate
>
	<ListIcon size={20} class="opacity-70" />
	Sommaire
</a>

<!-- Les valeurs de collage reprennent celles de `TableOfContent`: même rôle, même ancrage. -->
<nav
	class={[
		'surface sticky top-1 hidden w-56 shrink-0 self-start lg:block',
		'max-h-[calc(100dvh-1rem)] overflow-y-auto pb-2',
	]}
	aria-label="Documentation"
>
	{@render tree()}
</nav>

<Drawer key={DRAWER_KEY} title="Sommaire" maxWidth="20rem" class="surface-drawer">
	{#snippet children({ close })}
		{@render tree(close)}
	{/snippet}
</Drawer>

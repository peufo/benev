<script lang="ts">
	import type { Page } from '@prisma/client'
	import { page } from '$app/state'
	import { Popover } from 'fuma'
	import { on } from 'svelte/events'
	import { MenuIcon, GaugeIcon } from '@lucide/svelte'
	import { EventPubliqueMenuItems } from '$lib/event'
	import { adminTabs } from '$lib/layout/adminTabs.svelte'
	import { adminSubNav, scrollToSection } from '$lib/layout/adminSubNav.svelte'

	interface Props {
		pages: Pick<Page, 'id' | 'title' | 'type' | 'path'>[]
	}

	let { pages }: Props = $props()

	let adminIsVisible = $derived(page.data.member?.roles.includes('leader') || page.data.userIsRoot)
</script>

<div class="gap-2 hidden md:flex">
	<EventPubliqueMenuItems {pages} class="btn btn-ghost" classActive="btn-active" />
</div>

<Popover class="max-h-none min-w-50">
	{#snippet trigger({ trigger })}
		<button {...trigger} class="btn btn-square ml-2 md:hidden">
			<MenuIcon size={24} />
		</button>
	{/snippet}

	{#snippet children({ hide })}
		<!-- Les liens naviguent côté client: sans ce clic délégué, la feuille resterait ouverte
		     par-dessus la page d'arrivée. Les ancres de section ne naviguent même pas.
		     Attaché plutôt que posé en `onclick`: le conteneur n'est pas l'élément
		     interactif, ce sont les liens qu'il porte. -->
		<div class="menu w-full p-1 gap-1" {@attach (node) => on(node, 'click', hide)}>
			{#if adminIsVisible}
				<h3 class="title-sm pl-3 pt-1">Public</h3>
			{/if}
			<EventPubliqueMenuItems
				{pages}
				hideTeams={adminIsVisible}
				class="menu-item"
				classActive="active"
			/>

			<!-- ADMIN -->
			{#if adminIsVisible}
				<h3 class="title-sm pl-3 pt-1">Gestion</h3>
				{#each adminTabs() as { href, isActive, label, icon: Icon, sections } (href)}
					<a {href} class="menu-item" class:active={isActive}>
						<Icon size={20} class="opacity-70" />
						{label}
					</a>

					<!-- Le rail admin est masqué sous `lg`: sans ces entrées, une page à sections
					     n'aurait plus aucune navigation interne sur mobile. -->
					{#if isActive && sections}
						{@const activeId = adminSubNav.activeId || sections[0].id}
						{#each sections as section (section.id)}
							{@const SectionIcon = section.icon}
							<a
								href="#{section.id}"
								onclick={(event) => scrollToSection(event, section.id)}
								class="menu-item pl-8 text-xs"
								class:active={activeId === section.id}
							>
								<SectionIcon size={16} class="opacity-60" />
								{section.label}
							</a>
						{/each}
					{/if}
				{/each}

				{@const quotaHref = `/${page.params.eventId}/admin/quota`}
				<a
					href={quotaHref}
					class="menu-item"
					class:active={page.route.id?.startsWith('/[eventId]/admin/quota')}
				>
					<GaugeIcon size={20} class="opacity-70" />
					Quota
				</a>
			{/if}
		</div>
	{/snippet}
</Popover>

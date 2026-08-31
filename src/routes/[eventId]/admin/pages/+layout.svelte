<script lang="ts">
	import { IdCardLanyardIcon, PlusIcon } from '@lucide/svelte'
	import type { Page } from '@prisma/client'
	import { page } from '$app/state'
	import { tip } from 'fuma'
	import { eventPath } from '$lib/eventPath'
	import { PAGE_TYPE } from '$lib/constant'
	import { enhanceForm } from '$lib/enhanceForm'
	import OnlyAdmin from '../OnlyAdmin.svelte'
	import { createBadge, createPage } from './pages.remote'

	let { data, children } = $props()

	// Les deux volets ne cohabitent pas sous `md`: c'est la présence d'une publication dans
	// l'URL qui décide lequel occupe l'écran, et le retour arrière du navigateur rejoue la
	// bascule. Même règle qu'à /admin/teams.
	const selected = $derived(!!page.params.pageId || !!page.params.badgeId)
</script>

<!-- Pages et modèles d'email partagent la même route d'édition, et l'icône que `PAGE_TYPE`
     leur donne est facultative — `OptionRecord` la déclare ainsi. -->
{#snippet entry({ id, title, type }: { id: string; title: string; type: Page['type'] })}
	{@const EntryIcon = PAGE_TYPE[type].icon}
	<a
		href={eventPath('/admin/pages/[pageId]', { pageId: id })}
		class={['menu-item', page.params.pageId === id && 'active']}
	>
		{#if EntryIcon}
			<EntryIcon class="w-6 shrink-0 opacity-60" size={20} />
		{/if}
		<span class="min-w-0 truncate text-sm">{title}</span>
	</a>
{/snippet}

<OnlyAdmin>
	<div class="flex items-start gap-3">
		<aside
			class={[
				'surface w-full shrink-0 p-2 md:sticky md:top-1 md:w-72',
				'max-h-main overflow-auto',
				'flex flex-col gap-4',
				selected && 'max-md:hidden',
			]}
		>
			<!-- Les pages du site forment sa navigation: elles se lisent d'un bloc, séparées des
			     modèles, qui ne sont pas des destinations. -->
			<section class="flex flex-col gap-1">
				<div class="flex items-center gap-2 pl-3">
					<h2 class="title-md grow">Navigation</h2>
					<form
						{...createPage.enhance(enhanceForm({ success: 'Nouvelle page créée !' }))}
						class="contents"
					>
						<button class="btn btn-square btn-sm" use:tip={{ content: 'Nouvelle page' }}>
							<PlusIcon class="opacity-70" />
						</button>
					</form>
				</div>
				{#each data.pages as pageEntry (pageEntry.id)}
					{@render entry(pageEntry)}
				{/each}
			</section>

			<div class="border-soft border-t"></div>

			<section class="flex flex-col gap-1">
				<h2 class="title-md pl-3">Modèles d'email</h2>
				{#each data.emails as email (email.id)}
					{@render entry(email)}
				{/each}
			</section>

			<section class="flex flex-col gap-1">
				<div class="flex items-center gap-2 pl-3">
					<h2 class="title-md grow">Modèles de badge</h2>
					<form
						{...createBadge.enhance(enhanceForm({ success: 'Nouveau badge créé !' }))}
						class="contents"
					>
						<button class="btn btn-square btn-sm" use:tip={{ content: 'Nouveau badge' }}>
							<PlusIcon class="opacity-70" />
						</button>
					</form>
				</div>
				{#each data.badges as badge (badge.id)}
					<a
						href={eventPath('/admin/pages/badges/[badgeId]', { badgeId: badge.id })}
						class={['menu-item', page.params.badgeId === badge.id && 'active']}
					>
						<IdCardLanyardIcon class="w-6 shrink-0 opacity-60" size={20} />
						<span class="min-w-0 truncate text-sm">{badge.name}</span>
					</a>
				{/each}
			</section>
		</aside>

		<div class={['min-w-0 grow', !selected && 'max-md:hidden']}>
			{@render children?.()}
		</div>
	</div>
</OnlyAdmin>

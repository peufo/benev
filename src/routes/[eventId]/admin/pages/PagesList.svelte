<script lang="ts">
	import { MoveVerticalIcon, PlusIcon } from '@lucide/svelte'
	import type { Page } from '@prisma/client'
	import { isHttpError } from '@sveltejs/kit'
	import { invalidateAll } from '$app/navigation'
	import { page } from '$app/state'
	import { toast } from 'svelte-sonner'
	import { listEditable, tip } from 'fuma'
	import { eventPath } from '$lib/eventPath'
	import { PAGE_STATES, PAGE_TYPE } from '$lib/constant'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createPage, reorderPages } from './pages.remote'

	type PageRow = Pick<Page, 'id' | 'title' | 'type' | 'state'>

	interface Props {
		pages: PageRow[]
	}

	let { pages }: Props = $props()

	// L'accueil ouvre toujours la navigation: il reste hors du glissé, et hors de l'ordre envoyé.
	const home = $derived(pages.find(({ type }) => type === 'home'))
	// Dérivé assignable: le glissé pose le nouvel ordre sans attendre le serveur, et le
	// rechargement des données du layout le reprend ensuite.
	let ordered = $derived(pages.filter(({ type }) => type !== 'home'))

	/**
	 * La poignée de glissé arrête la propagation du clic qui suit le relâchement, mais pas
	 * l'action par défaut du lien: sans cette interception, un simple glissé changerait de page.
	 * Elle ne vise que la poignée: ailleurs sur la ligne, le lien navigue comme un lien.
	 */
	function interceptClick(event: MouseEvent) {
		if ((event.target as Element).closest('.drag-button')) event.preventDefault()
	}

	async function handleReorder(reordered: PageRow[]) {
		ordered = reordered
		try {
			await reorderPages(reordered.map(({ id }) => id))
			await invalidateAll()
			toast.success('Nouvel ordre sauvegardé')
		} catch (err) {
			console.error(err)
			toast.error(isHttpError(err) ? err.body.message : 'Réordonnancement impossible')
		}
	}
</script>

<!-- Un brouillon prend l'icône de son statut: le type se lit dans le volet de droite. -->
{#snippet row({ id, title, type, state }: PageRow, draggable: boolean)}
	{@const EntryIcon = state === 'draft' ? PAGE_STATES.draft.icon : PAGE_TYPE[type].icon}
	<a
		href={eventPath('/admin/pages/[pageId]', { pageId: id })}
		onclickcapture={interceptClick}
		draggable="false"
		class={['menu-item group select-none', page.params.pageId === id && 'active']}
	>
		{#if EntryIcon}
			<span
				class={['inline-flex w-6 shrink-0', state === 'draft' ? 'text-warning' : 'opacity-60']}
				use:tip={{ content: state === 'draft' ? PAGE_STATES.draft.label : undefined }}
			>
				<EntryIcon size={20} />
			</span>
		{/if}
		<span class="min-w-0 truncate text-sm">{title}</span>
		{#if draggable}
			<span
				class={[
					'drag-button btn btn-sm btn-square btn-ghost',
					'absolute right-1 opacity-0 pointer-fine:group-hover:opacity-100',
					'pointer-coarse:static pointer-coarse:opacity-100 ml-auto',
				]}
			>
				<MoveVerticalIcon size={16} class="text-base-content/70" />
			</span>
		{/if}
	</a>
{/snippet}

<section class="flex flex-col gap-1">
	<div class="flex items-center gap-2 pl-3">
		<h2 class="title-md grow">Navigation</h2>
		<form
			{...createPage.enhance(enhanceForm({ success: 'Nouvelle page créée, en brouillon' }))}
			class="contents"
		>
			<button
				class="btn btn-square btn-sm btn-primary btn-soft"
				use:tip={{ content: 'Nouvelle page' }}
			>
				<PlusIcon class="opacity-70" />
			</button>
		</form>
	</div>

	{#if home}
		{@render row(home, false)}
	{/if}

	<div
		class="flex flex-col gap-1"
		use:listEditable={{
			items: ordered,
			onChange: handleReorder,
			dragElementsSelector: '.drag-button',
		}}
	>
		{#each ordered as pageEntry (pageEntry.id)}
			{@render row(pageEntry, true)}
		{/each}
	</div>
</section>

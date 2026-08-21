<script lang="ts">
	import { SaveIcon, SavePenIcon } from '@lucide/svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	import { Dialog, InputSelect, InputString, tip, type PopoverType } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createView, deleteView, updateView } from './view.remote'
	import { slide } from 'svelte/transition'

	type View = {
		id: string
		name: string
		query: string
	}

	interface Props {
		key: string
		views: View[]
		/**
		 * Paramètres d'URL qui ne décrivent pas un filtre et ne doivent donc ni entrer dans une vue
		 * enregistrée, ni la faire passer pour modifiée. Les clés `form_*` — tiroirs et dialogues —
		 * le sont déjà d'office.
		 */
		ignoredKeys?: string[]
	}

	let { key, views, ignoredKeys = [] }: Props = $props()

	let dialog: HTMLDialogElement = $state()!

	// L'absence de filtre est une vue comme les autres: le select porte alors toujours une
	// valeur, et « Vue simple » se choisit exactement comme une vue enregistrée.
	const simpleView: View = { id: '', name: 'Vue simple', query: '' }

	let query = $derived(getQuery(page.url.searchParams))
	// Les vues enregistrées repassent par le même nettoyage: une clé devenue ignorée ne doit pas
	// décrocher celles qui l'avaient enregistrée avant.
	let selectedView = $derived(views.find((v) => getQuery(v.query) === query))
	/** Des filtres posés à la main, qui ne correspondent à aucune vue enregistrée. */
	let isNewView = $derived(!!query && !selectedView)
	let items = $derived([simpleView, ...views])
	// `bind:` et non simple prop: la sélection vient de l'URL, que le composant ne pilote pas
	// seul — un filtre modifié ailleurs doit faire suivre le libellé affiché.
	let value = $derived(
		selectedView ?? (isNewView ? { id: 'new', name: 'Nouvelle vue', query } : simpleView)
	)
	let editedView = $derived(isNewView ? undefined : selectedView)

	/** La pagination n'est pas un filtre, pas plus que l'état des tiroirs ouverts par l'URL. */
	function isIgnored(paramKey: string) {
		if (paramKey === 'skip' || paramKey === 'take') return true
		if (paramKey.startsWith('form_')) return true
		return ignoredKeys.includes(paramKey)
	}

	/** Gabarit comparable d'un jeu de filtres, débarrassé de ce qui n'en est pas un. */
	function getQuery(source: URLSearchParams | string) {
		// Construit puis sérialisé immédiatement: pas un état réactif.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const searchParam = new URLSearchParams(source)
		// Les clés sont figées avant la boucle: l'itérateur de `URLSearchParams` suit les
		// suppressions et sauterait l'entrée suivante.
		for (const paramKey of [...searchParam.keys()]) {
			if (isIgnored(paramKey)) searchParam.delete(paramKey)
		}
		return searchParam.toString()
	}
</script>

{#snippet updateButton(view: View, { popover }: { popover: PopoverType })}
	{#if view !== simpleView}
		<button
			class="btn btn-square btn-ghost btn-sm group-hover:bg-base-200"
			onclick={() => {
				popover.hide()
				selectedView = view
				dialog.showModal()
			}}
		>
			<SavePenIcon size={18} class="opacity-70" />
		</button>
	{/if}
{/snippet}

<div class="flex">
	<InputSelect
		bind:value
		{items}
		getLabel={(view) => view.name}
		proposalAppend={updateButton}
		onSelect={(view) =>
			goto(view?.query ? `${page.url.pathname}?${view.query}` : page.url.pathname)}
		class={['input-sm min-w-32', isNewView && 'rounded-r-none']}
		propsLi={{ class: 'flex-row gap-1 group w-full flex-nowrap' }}
	/>
	{#if isNewView}
		<button
			class="btn btn-square btn-sm joint-item btn-soft rounded-l-none"
			use:tip={{ content: 'Enregistrer comme nouvelle vue' }}
			onclick={() => dialog.showModal()}
			transition:slide={{ axis: 'x' }}
		>
			<SaveIcon size={18} class="opacity-70" />
		</button>
	{/if}
</div>

<Dialog bind:dialog class="border-hard">
	{#snippet header()}
		{#if editedView}
			<h2 class="title">Enregistrer la vue</h2>
		{:else}
			<h2 class="title">Enregistrer comme nouvelle vue</h2>
		{/if}
	{/snippet}

	<!-- `field.as(type, value)` ne fournit qu'une valeur initiale: sans remontage, le nom
	     resterait celui de la vue précédemment ouverte. -->
	{#key editedView}
		{@const remoteForm = editedView ? updateView : createView}
		<form
			{...remoteForm.enhance(enhanceForm({ onsuccess: () => dialog.close() }))}
			{...deleteView.enhance(
				enhanceForm({
					onsuccess: () => {
						dialog.close()
						// La vue supprimée laisserait ses filtres dans l'URL, donc une « Nouvelle vue ».
						goto(page.url.pathname)
					},
				})
			)}
		>
			{#if editedView}
				<input type="hidden" name="id" value={editedView.id} />
			{/if}
			<input type="hidden" name="key" value={key} />
			<input type="hidden" name="query" value={query} />

			<InputString
				field={remoteForm.fields.name}
				label="Nom de la vue"
				value={editedView?.name || ''}
				autofocus
			/>

			<div class="mt-2 flex flex-row-reverse justify-between gap-2">
				<button formaction={remoteForm.action} class="btn"> Valider </button>

				{#if editedView}
					<button formaction={deleteView.action} class="btn btn-ghost text-error">
						Supprimer
					</button>
				{/if}
			</div>
		</form>
	{/key}
</Dialog>

<script lang="ts">
	import { PencilIcon, PlusIcon } from '@lucide/svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'

	import { Dialog, InputSelect, InputString, tip, type PopoverType } from 'fuma'
	import { enhanceForm } from '$lib/enhanceForm'
	import { createView, deleteView, updateView } from './view.remote'

	type View = {
		id: string
		name: string
		query: string
	}

	interface Props {
		key: string
		views: View[]
	}

	let { key, views }: Props = $props()

	let dialog: HTMLDialogElement = $state()!

	// L'absence de filtre est une vue comme les autres: le select porte alors toujours une
	// valeur, et « Vue simple » se choisit exactement comme une vue enregistrée.
	const simpleView: View = { id: '', name: 'Vue simple', query: '' }

	let query = $derived(getQuery(page.url))
	let selectedView = $derived(views.find((v) => v.query === query))
	/** Des filtres posés à la main, qui ne correspondent à aucune vue enregistrée. */
	let isNewView = $derived(!!query && !selectedView)
	let items = $derived([simpleView, ...views])
	// `bind:` et non simple prop: la sélection vient de l'URL, que le composant ne pilote pas
	// seul — un filtre modifié ailleurs doit faire suivre le libellé affiché.
	let value = $derived(
		selectedView ?? (isNewView ? { id: 'new', name: 'Nouvelle vue', query } : simpleView)
	)
	let editedView = $derived(isNewView ? undefined : selectedView)

	function getQuery({ searchParams }: URL) {
		// Construit puis sérialisé immédiatement: pas un état réactif.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const searchParam = new URLSearchParams(searchParams)
		searchParam.delete('skip')
		searchParam.delete('take')
		return searchParam.toString()
	}
</script>

{#snippet viewAction(popover: PopoverType)}
	<button
		type="button"
		class="btn btn-square btn-soft btn-sm"
		onclick={() => {
			popover.hide()
			dialog.showModal()
		}}
	>
		<span
			class="inline-flex"
			use:tip={{ content: isNewView ? 'Enregistrer la vue' : 'Modifier la vue' }}
		>
			{#if isNewView}
				<PlusIcon size={18} />
			{:else}
				<PencilIcon size={18} />
			{/if}
		</span>
	</button>
{/snippet}

<InputSelect
	bind:value
	{items}
	getLabel={(view) => view.name}
	onSelect={(view) => goto(view?.query ? `${page.url.pathname}?${view.query}` : page.url.pathname)}
	append={query ? viewAction : undefined}
	class="input-sm w-40"
/>

<Dialog bind:dialog>
	{#snippet header()}
		<h2 class="title">
			{editedView ? 'Modifier la vue' : 'Enregistrer la vue'}
		</h2>
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
			/>

			<div class="mt-2 flex flex-row-reverse gap-2">
				<button class="btn"> Valider </button>

				{#if editedView}
					<button formaction={deleteView.action} class="btn btn-ghost text-error">
						Supprimer
					</button>
				{/if}
			</div>
		</form>
	{/key}
</Dialog>

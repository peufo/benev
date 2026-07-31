<script lang="ts">
	import { ChevronDownIcon, PlusIcon, SaveIcon } from '@lucide/svelte'
	import { page } from '$app/state'

	import { Dialog, DropDown, InputString, tip } from 'fuma'
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

	// Sorti de `fuma-legacy`: fuma 2 ne propose qu'un `TableViewSelect` limité à `views`,
	// et l'enregistrement passe maintenant par des remote functions.
	let query = $derived(getQuery(page.url))
	let selectedView = $derived(views.find((v) => v.query === query))
	let isNewView = $derived(!!query && !selectedView)
	let editedView = $state<View | undefined>(undefined)

	function getQuery({ searchParams }: URL) {
		// Construit puis sérialisé immédiatement: pas un état réactif.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const searchParam = new URLSearchParams(searchParams)
		searchParam.delete('skip')
		searchParam.delete('take')
		return searchParam.toString()
	}
</script>

<DropDown>
	{#snippet activator()}
		<button
			type="button"
			class="menu-item bordered btn-sm gap-1 rounded-lg border font-semibold opacity-90"
		>
			<span>{isNewView ? 'Nouvelle vue' : selectedView?.name || 'Vue simple'}</span>
			<ChevronDownIcon size={20} class="translate-x-1 translate-y-px opacity-90" />
		</button>
	{/snippet}

	<ul class="flex flex-col gap-1">
		{#if isNewView}
			<li>
				<button
					type="button"
					class="menu-item w-full pr-[6px]"
					onclick={() => {
						editedView = undefined
						dialog.showModal()
					}}
				>
					<span>Ajouter la nouvelle vue</span>
					<PlusIcon class="ml-auto opacity-80" size={21} />
				</button>
				<hr class="my-1" />
			</li>
		{/if}

		<li>
			<a href={page.url.pathname} class="menu-item" class:active={!query}>
				<span class="grow">Vue simple</span>
			</a>
		</li>

		{#each views as view (view.id)}
			<li>
				<a
					href="{page.url.pathname}?{view.query}"
					class="menu-item group pr-1"
					class:active={view.id === selectedView?.id}
				>
					<span class="grow">{view.name}</span>
					<button
						type="button"
						class="btn btn-square btn-ghost btn-xs rounded"
						onclick={(event) => {
							event.preventDefault()
							editedView = view
							dialog.showModal()
						}}
					>
						<span class="inline-flex" use:tip={{ content: `Modifier la vue '${view.name}'` }}
							><SaveIcon class="opacity-50 group-hover:opacity-80" size={18} /></span
						>
					</button>
				</a>
			</li>
		{/each}
	</ul>
</DropDown>

<Dialog bind:dialog>
	{#snippet header()}
		<h2 class="title">
			{#if editedView}
				Modifier la vue
			{:else}
				Ajouter la nouvelle vue
			{/if}
		</h2>
	{/snippet}

	{@const remoteForm = editedView ? updateView : createView}
	<form
		{...remoteForm.enhance(async ({ submit }) => {
			await submit()
			dialog.close()
		})}
		{...deleteView.enhance(async ({ submit }) => {
			await submit()
			dialog.close()
		})}
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
				<button formaction={deleteView.action} class="btn btn-ghost text-error"> Supprimer </button>
			{/if}
		</div>
	</form>
</Dialog>

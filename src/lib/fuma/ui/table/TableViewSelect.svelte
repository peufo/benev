<script lang="ts">
	import { preventDefault } from 'svelte/legacy'

	import { onMount } from 'svelte'
	import { mdiChevronDown, mdiContentSaveEditOutline, mdiPlus } from '@mdi/js'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'

	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { Dialog } from '$lib/fuma/ui/dialog/index.js'
	import { DropDown } from '$lib/fuma/ui/menu/index.js'
	import { InputText } from '$lib/fuma/ui/input/index.js'
	import { useForm } from '$lib/fuma/validation/form.js'

	type View = {
		id: string
		name: string
		query: string
	}

	interface Props {
		key: string
		views: View[]
		action?: string
		actionCreate?: string
		actionUpdate?: string
		actionDelete?: string
	}

	let {
		key,
		views,
		action = '',
		actionCreate = '?/view_create',
		actionUpdate = '?/view_update',
		actionDelete = '?/view_delete',
	}: Props = $props()

	let dialog: HTMLDialogElement = $state()
	const form = useForm({
		onSuccess() {
			dialog.close()
		},
	})

	let query = $state(getQuery($page.url))
	let selectedView = $state(views.find((v) => v.query === query))
	let isNewView = $state(!!query && !selectedView)

	onMount(() =>
		page.subscribe(({ url }) => {
			query = getQuery(url)
			selectedView = views.find((v) => v.query === query)
			isNewView = !!query && !selectedView
		})
	)

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
			<Icon path={mdiChevronDown} size={20} class="translate-x-1 translate-y-[1px] opacity-90" />
		</button>
	{/snippet}

	<ul class="flex flex-col gap-1">
		{#if isNewView}
			<li>
				<button
					type="button"
					class="menu-item w-full pr-[6px]"
					onclick={() => {
						selectedView = undefined
						dialog.showModal()
					}}
				>
					<span>Ajouter la nouvelle vue</span>
					<Icon path={mdiPlus} class="ml-auto opacity-80" size={21} />
				</button>
				<hr class="my-1" />
			</li>
		{/if}

		<li>
			<a href={$page.url.pathname} class="menu-item" class:active={!query}>
				<span class="grow">Vue simple</span>
			</a>
		</li>

		{#each views as view (view.id)}
			<li>
				<a
					href="{$page.url.pathname}?{view.query}"
					class="menu-item group pr-1"
					class:active={view.id === selectedView?.id}
				>
					<span class="grow">{view.name}</span>
					<button
						type="button"
						class="btn btn-square btn-ghost btn-xs rounded"
						onclick={preventDefault(() => {
							selectedView = view
							dialog.showModal()
						})}
					>
						<Icon
							path={mdiContentSaveEditOutline}
							class="opacity-50 group-hover:opacity-80"
							size={18}
							title="Modifier la vue '{view.name}'"
						/>
					</button>
				</a>
			</li>
		{/each}
	</ul>
</DropDown>

<Dialog bind:dialog>
	{#snippet header()}
		<h2 class="title">
			{#if selectedView}
				Modifier la vue
			{:else}
				Ajouter la nouvelle vue
			{/if}
		</h2>
	{/snippet}

	<form
		action="{action}{selectedView ? actionUpdate : actionCreate}"
		method="post"
		use:enhance={form.submit}
	>
		{#if selectedView}
			<input type="hidden" name="id" value={selectedView.id} />
		{/if}
		<input type="hidden" name="key" value={key} />
		<input type="hidden" name="query" value={query} />

		<InputText
			key="name"
			input={{ placeholder: 'Nom de la vue' }}
			value={selectedView?.name || ''}
		/>

		<div class="mt-2 flex flex-row-reverse gap-2">
			<button class="btn"> Valider </button>

			<button formaction="{action}{actionDelete}" class="btn btn-ghost text-error">
				Supprimer
			</button>
		</div>
	</form>
</Dialog>

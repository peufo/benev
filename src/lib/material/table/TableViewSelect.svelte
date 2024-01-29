<script lang="ts">
	import { mdiChevronDown, mdiContentSaveEditOutline, mdiPlus } from '@mdi/js'
	import type { View } from '@prisma/client'
	import { Dialog, DropDown, Icon, InputText } from '$lib/material'
	import { eventPath } from '$lib/store'
	import { page } from '$app/stores'
	import { useForm } from '$lib/validation'
	import { enhance } from '$app/forms'
	import { onMount } from 'svelte'

	export let key: string
	export let views: View[]

	let dialog: HTMLDialogElement
	const form = useForm({
		onSuccess() {
			dialog.close()
		},
	})

	let query = getQuery($page.url)
	let selectedView = views.find((v) => v.query === query)
	let isNewView = !!query && !selectedView

	onMount(() =>
		page.subscribe(({ url }) => {
			query = getQuery(url)
			selectedView = views.find((v) => v.query === query)
			isNewView = !!query && !selectedView
		})
	)

	function getQuery({ searchParams }: URL) {
		const searchParam = new URLSearchParams(searchParams)
		searchParam.delete('skip')
		searchParam.delete('take')
		return searchParam.toString()
	}
</script>

<DropDown>
	<button
		type="button"
		slot="activator"
		class="menu-item btn-sm border bordered font-semibold opacity-90 gap-1 rounded-lg"
	>
		<span>{isNewView ? 'Nouvelle vue' : selectedView?.name || 'Vue simple'}</span>
		<Icon path={mdiChevronDown} size={20} class="opacity-90 translate-x-1 translate-y-[1px]" />
	</button>

	<ul class="flex flex-col gap-1">
		{#if isNewView}
			<li>
				<button
					type="button"
					class="menu-item w-full pr-[6px]"
					on:click={() => {
						selectedView = undefined
						dialog.showModal()
					}}
				>
					<span>Ajouter la nouvelle vue</span>
					<Icon path={mdiPlus} class="opacity-80 ml-auto" size={21} />
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
					class="menu-item pr-1 group"
					class:active={view.id === selectedView?.id}
				>
					<span class="grow">{view.name}</span>
					<button
						type="button"
						class="btn btn-xs btn-square btn-ghost rounded"
						on:click|preventDefault={() => {
							selectedView = view
							dialog.showModal()
						}}
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
	<h2 slot="header" class="title">
		{#if selectedView}
			Modifier la vue
		{:else}
			Ajouter la nouvelle vue
		{/if}
	</h2>

	<form
		action="{$eventPath}/admin?/{selectedView ? 'update_view' : 'create_view'}"
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

		<div class="flex flex-row-reverse mt-2 gap-2">
			<button class="btn"> Valider </button>

			<button formaction="{$eventPath}/admin?/delete_view" class="btn btn-ghost text-error">
				Supprimer
			</button>
		</div>
	</form>
</Dialog>

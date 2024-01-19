<script lang="ts">
	import { mdiChevronDown, mdiContentSaveEditOutline, mdiPencilOutline, mdiPlus } from '@mdi/js'
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
		successCallback() {
			dialog.close()
		},
	})

	let query = ''
	let selectedView: View | undefined = undefined
	let isNewView = false

	onMount(() =>
		page.subscribe(({ url }) => {
			const searchParam = new URLSearchParams(url.searchParams)
			searchParam.delete('skip')
			searchParam.delete('take')
			query = searchParam.toString()
			selectedView = views.find((v) => v.query === query)
			isNewView = !!query && !selectedView
		})
	)
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

	<ul>
		<li>
			<a href={$page.url.pathname} class="menu-item pr-1" class:active={!query}>
				<span class="grow">Vue simple</span>
			</a>
		</li>

		{#each views as view (view.id)}
			<li>
				<a
					href="{$page.url.pathname}?{view.query}"
					class="menu-item group"
					class:pr-1={isNewView}
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

		{#if isNewView}
			<hr class="my-1" />
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
			</li>
		{/if}
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

		<div class="flex flex-row-reverse mt-2">
			<button class="btn"> Valider </button>

			<button formaction="{$eventPath}/admin?/delete_view" class="btn btn-ghost text-error">
				Supprimer
			</button>
		</div>
	</form>
</Dialog>

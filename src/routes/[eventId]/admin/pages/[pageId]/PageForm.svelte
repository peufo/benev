<script lang="ts">
	import { enhance } from '$app/forms'
	import { mdiCheck, mdiLink, mdiLoading } from '@mdi/js'
	import type { Page } from '@prisma/client'

	import { useForm } from '$lib/validation'
	import {
		DeleteButton,
		FormControl,
		Icon,
		InputSelect,
		InputText,
		InputTextRich,
	} from '$lib/material'
	import { normalizePath } from '$lib/normalizePath'
	import { eventPath } from '$lib/store'
	import { PAGE_TYPE } from '$lib/constant'
	import { debounce } from '$lib/debounce'
	import PageTypeHelp from './PageTypeHelp.svelte'
	import { invalidateAll } from '$app/navigation'
	import { tick } from 'svelte'
	import { suggestionItems, type SuggestionItem } from '$lib/material/input/textRich/suggestion'

	export let page: Page
	export let charterAlreadyExist: boolean

	let inputTextRich: InputTextRich
	let isDirty = false
	let successInvalidateAll = false
	const form = useForm({
		successUpdate: false,
		successMessage: false,
		async onSuccess(action) {
			if (successInvalidateAll || action.search === '?/delete_page') await invalidateAll()
			isDirty = false
		},
	})
	const { home, charter, ...pageTypes } = PAGE_TYPE
	let submitButton: HTMLButtonElement

	$: pagePath = `${$eventPath}${page.type === 'home' ? '' : `/${normalizePath(page.title)}`}`
	$: suggestionItems.set(getSuggestionItems(page))

	function getSuggestionItems(p: Page): SuggestionItem[] {
		if (p.type !== 'member') return []
		return [
			{ id: 'firstName', label: 'Prénom' },
			{ id: 'lastName', label: 'Nom de famille' },
			{ id: 'name', label: 'Nom et prénom' },
			{ id: 'age', label: 'Age' },
			{ id: 'address', label: 'Address' },
			{ id: 'subscribes', label: 'Liste des inscriptions' },
			{ id: 'nbSubscribe', label: "Nombre d'inscriptions" },
			{ id: 'teams', label: 'Liste des secteurs' },
			{ id: 'nbTeams', label: 'Nombre de secteurs' },
			{ id: 'gifts', label: 'Liste des compensations' },
		]
	}

	function handleChange() {
		isDirty = true
		autosave()
	}
	async function handleChangeImediat() {
		isDirty = true
		successInvalidateAll = true
		await tick()
		submitButton.click()
	}

	const autosave = debounce(() => {
		successInvalidateAll = false
		submitButton.click()
	}, 800)
</script>

<form method="post" action="?/update_page" use:enhance={form.submit} class="flex flex-col gap-2">
	<div class="flex flex-wrap gap-2 items-end">
		<InputText label="Titre" key="title" value={page.title} on:input={handleChangeImediat} />

		<FormControl label="Type de page">
			<svelte:fragment slot="label_append">
				<PageTypeHelp />
			</svelte:fragment>

			{#if page.type === 'home'}
				<input type="hidden" name="type" value="home" />
				<div class="menu-item rounded-lg disabled border bordered h-12">
					<Icon path={home.icon} size={21} class="opacity-70" />
					<span>{home.label}</span>
				</div>
			{:else}
				<InputSelect
					key="type"
					noBtnClass
					class="menu-item rounded-lg border bordered h-12"
					options={charterAlreadyExist && page.type !== 'charter'
						? pageTypes
						: { charter, ...pageTypes }}
					value={page.type}
					on:select={handleChangeImediat}
				/>
			{/if}
		</FormControl>
	</div>

	<input type="hidden" name="id" value={page.id} />
	<input type="hidden" name="path" value={normalizePath(page.title)} />
	<input type="hidden" name="eventId" value={page.eventId} />

	{#key page.id}
		<InputTextRich
			bind:this={inputTextRich}
			key="content"
			value={page.content}
			on:change={handleChange}
		/>
	{/key}

	<div class="flex gap-2">
		<button class="hidden" bind:this={submitButton}>Sauvegarder</button>

		<DeleteButton formaction="?/delete_page" disabled={page.type === 'home'} />
		<div class="grow" />

		{#if isDirty}
			<div class="flex gap-1 items-center">
				<Icon path={mdiLoading} class="animate-spin fill-warning" size={20} />
				<span class="text-sm text-base-content/70">Sauvegarde</span>
			</div>
		{:else}
			<div class="flex gap-1 items-center">
				<Icon path={mdiCheck} class="fill-success" size={20} />
				<span class="text-sm text-base-content/70">Sauvegardé</span>
			</div>
		{/if}

		<a
			href={pagePath}
			class="flex items-center gap-1 mr-auto link link-hover text-sm opacity-70 pr-4"
		>
			<Icon path={mdiLink} class="opacity-60 -rotate-45" size={18} />
			<span>{pagePath}</span>
		</a>
	</div>
</form>

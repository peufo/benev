<script lang="ts">
	import { enhance } from '$app/forms'
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
	import { mdiCheck, mdiLink, mdiLoading } from '@mdi/js'
	import { PAGE_TYPE } from '$lib/constant'
	import PageTypeHelp from './PageTypeHelp.svelte'
	import { debounce } from '$lib/debounce'

	export let page: Page
	export let charterAlreadyExist: boolean

	let isDirty = false
	const form = useForm({
		successUpdate: false,
		successMessage: false,
		onSuccess() {
			isDirty = false
		},
	})
	const { home, charter, ...pageTypes } = PAGE_TYPE
	let submitButton: HTMLButtonElement

	$: pagePath = `${$eventPath}${page.type === 'home' ? '' : `/${normalizePath(page.title)}`}`

	function handleChange() {
		isDirty = true
		autosave()
	}
	function handleChangeImediat() {
		isDirty = true
		submitButton.click()
	}

	const autosave = debounce(() => {
		submitButton.click()
	}, 800)
</script>

<form method="post" action="?/update_page" use:enhance={form.submit} class="flex flex-col gap-2">
	<div class="flex flex-wrap gap-2 items-end">
		<InputText label="Titre" key="title" value={page.title} on:input={handleChange} />

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

	<InputTextRich
		key="content"
		value={page.content}
		classToolbar="top-14"
		on:change={handleChange}
	/>

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

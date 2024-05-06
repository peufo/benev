<script lang="ts">
	import { enhance } from '$app/forms'
	import { mdiCheck, mdiLink, mdiLoading } from '@mdi/js'
	import type { Page } from '@prisma/client'
	import { invalidateAll } from '$app/navigation'
	import { tick } from 'svelte'
	import { ButtonDelete, FormControl, Icon, InputSelect, InputText, InputTextRich } from 'fuma'

	import { useForm } from 'fuma/validation'
	import { normalizePath } from '$lib/normalizePath'
	import { eventPath } from '$lib/store'
	import { PAGE_TYPE } from '$lib/constant'
	import { debounce } from '$lib/debounce'
	import PageTypeHelp from './PageTypeHelp.svelte'

	export let page: Page
	export let charterAlreadyExist: boolean

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
	const { home, charter, email, ...pageTypes } = PAGE_TYPE
	let submitButton: HTMLButtonElement

	$: pagePath = `${$eventPath}${page.type === 'home' ? '' : `/${normalizePath(page.title)}`}`

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
	<div class="flex gap-2 items-start">
		<InputText
			label="Titre"
			class="grow"
			key="title"
			value={page.title}
			on:input={handleChangeImediat}
			hint={page.description || ''}
		/>

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
			{:else if page.type === 'email'}
				<input type="hidden" name="type" value="email" />
				<div class="menu-item rounded-lg disabled border bordered h-12">
					<Icon path={email.icon} size={21} class="opacity-70" />
					<span>{email.label}</span>
				</div>
			{:else}
				<InputSelect
					key="type"
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
	<input type="hidden" name="eventId" value={page.eventId} />
	{#if page.type !== 'email'}
		<input type="hidden" name="path" value={normalizePath(page.title)} />
	{/if}

	{#key page.id}
		<InputTextRich key="content" value={page.content} on:change={handleChange} />
	{/key}

	<div class="flex gap-2">
		<button class="hidden" bind:this={submitButton}>Sauvegarder</button>

		<ButtonDelete
			formaction="?/delete_page"
			disabled={page.type === 'home' || page.type === 'email'}
		/>
		<div class="grow" />

		{#if page.type !== 'email'}
			<a
				href={pagePath}
				class="flex items-center gap-1 mr-auto link link-hover text-sm opacity-70 pr-4"
			>
				<Icon path={mdiLink} class="opacity-60 -rotate-45" size={18} />
				<span>{pagePath}</span>
			</a>
		{/if}

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
	</div>
</form>

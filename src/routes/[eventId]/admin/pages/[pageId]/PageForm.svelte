<script lang="ts">
	import { CheckIcon, LinkIcon, LoaderCircleIcon } from '@lucide/svelte'
	import type { Page } from '@prisma/client'
	import { invalidateAll } from '$app/navigation'
	import { tick } from 'svelte'
	import { FormControl, InputTextRich } from '$lib/ui'
	import { ButtonDelete, InputSelect, InputString } from 'fuma'

	import { normalizePath } from '$lib/normalizePath'
	import { eventPath } from '$lib/store'
	import { PAGE_TYPE } from '$lib/constant'
	import { debounce } from '$lib/debounce'
	import PageTypeHelp from './PageTypeHelp.svelte'
	import { SelectMedia } from '$lib/material/media'
	import { deletePage, updatePage } from './page.remote'

	interface Props {
		page: Page
		charterAlreadyExist: boolean
	}

	let { page, charterAlreadyExist }: Props = $props()

	let selectMedia: SelectMedia = $state()!
	let isDirty = $state(false)
	let successInvalidateAll = false
	const { home, charter, email, ...pageTypes } = PAGE_TYPE

	// Une charte déjà publiée disparaît des choix, sauf si c'est celle qu'on édite.
	const selectableTypes = $derived(
		Object.entries(
			charterAlreadyExist && page.type !== 'charter' ? pageTypes : { charter, ...pageTypes }
		).map(([value, option]) => ({ value: value as Page['type'], ...option }))
	)
	// Dérivé assignable: le type choisi est soumis avant que le serveur ne réponde, et `page`
	// change d'une publication à l'autre sans que le composant soit remonté.
	let pageType = $derived(page.type)
	let submitButton: HTMLButtonElement = $state()!
	let inputTextRich: InputTextRich = $state()!

	let pagePath = $derived(
		`${$eventPath}${page.type === 'home' ? '' : `/${normalizePath(page.title)}`}`
	)

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

<form
	{...updatePage.enhance(async ({ submit }) => {
		await submit()
		// Le titre et le type se répercutent sur la barre latérale et sur le chemin public.
		if (successInvalidateAll) await invalidateAll()
		isDirty = false
	})}
	class="flex flex-col gap-2"
>
	<div class="flex gap-2 items-start">
		<InputString
			label="Titre"
			class="grow"
			field={updatePage.fields.title}
			value={page.title}
			oninput={handleChangeImediat}
		/>

		<FormControl label="Type de page" enhanceDisabled>
			{#snippet label_append()}
				<PageTypeHelp />
			{/snippet}

			{#if page.type === 'home'}
				<input type="hidden" name="type" value="home" />
				<div class="menu-item rounded-lg disabled border bordered h-12">
					<home.icon size={21} class="opacity-70" />
					<span>{home.label}</span>
				</div>
			{:else if page.type === 'email'}
				<input type="hidden" name="type" value="email" />
				<div class="menu-item rounded-lg disabled border bordered h-12">
					<email.icon size={21} class="opacity-70" />
					<span>{email.label}</span>
				</div>
			{:else}
				<input type="hidden" name="type" value={pageType} />
				<InputSelect
					items={selectableTypes}
					getValue={(option) => option.value}
					value={pageType}
					onSelect={(option) => {
						pageType = option.value
						handleChangeImediat()
					}}
				>
					{#snippet selected(option)}
						<span class="flex items-center gap-2">
							<option.icon size={21} class="opacity-70" />
							<span>{option.label}</span>
						</span>
					{/snippet}
					{#snippet proposal(option)}
						<option.icon size={18} class="opacity-70" />
						<span>{option.label}</span>
					{/snippet}
				</InputSelect>
			{/if}
		</FormControl>
	</div>

	<input type="hidden" name="id" value={page.id} />
	{#if page.type !== 'email'}
		<input type="hidden" name="path" value={normalizePath(page.title)} />
	{/if}

	{#key page.id}
		<InputTextRich
			bind:this={inputTextRich}
			key="content"
			enhanceDisabled
			value={page.content}
			onchange={handleChange}
			oninsertMedia={() => {
				selectMedia.show()
			}}
		/>
	{/key}

	<!-- Les refus métier (titre déjà pris, charte en double) remontent au niveau du formulaire -->
	{#each updatePage.fields.issues() ?? [] as issue (issue.message)}
		<p class="text-error text-sm">{issue.message}</p>
	{/each}

	<div class="flex gap-2">
		<button class="hidden" bind:this={submitButton}>Sauvegarder</button>

		{#if page.type !== 'email'}
			<a
				href={pagePath}
				class="flex items-center gap-1 mr-auto link link-hover text-sm opacity-70 pr-4"
			>
				<LinkIcon class="opacity-60 -rotate-45" size={18} />
				<span>{pagePath}</span>
			</a>
		{/if}

		{#if isDirty}
			<div class="flex gap-1 items-center">
				<LoaderCircleIcon class="animate-spin text-warning" size={20} />
				<span class="text-sm text-base-content/70">Sauvegarde</span>
			</div>
		{:else}
			<div class="flex gap-1 items-center">
				<CheckIcon class="text-success" size={20} />
				<span class="text-sm text-base-content/70">Sauvegardé</span>
			</div>
		{/if}
	</div>
</form>

<form {...deletePage}>
	<ButtonDelete
		formaction={deletePage.action}
		disabled={page.type === 'home' || page.type === 'email'}
	/>
</form>

<SelectMedia
	bind:this={selectMedia}
	onselect={(media) => {
		inputTextRich.setImage({
			src: `/media/${media.id}`,
			alt: media.name,
		})
	}}
/>

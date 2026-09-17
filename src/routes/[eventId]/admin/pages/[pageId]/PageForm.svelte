<script lang="ts">
	import { LinkIcon } from '@lucide/svelte'
	import type { Page, PageState } from '@prisma/client'
	import { invalidateAll } from '$app/navigation'
	import { InputTextRich, SaveBar } from '$lib/ui'
	import { ButtonDelete, InputSelect, InputString } from 'fuma'

	import { normalizePath } from '$lib/normalizePath'
	import { eventPath } from '$lib/eventPath'
	import { PAGE_STATES, PAGE_TYPE } from '$lib/constant'
	import PageTypeHelp from './PageTypeHelp.svelte'
	import { enhanceForm } from '$lib/enhanceForm'
	import { mediaDrawer } from '$lib/material/media'
	import { deletePage, updatePage } from './page.remote'

	interface Props {
		page: Page
		charterAlreadyExist: boolean
	}

	let { page, charterAlreadyExist }: Props = $props()

	const { home, charter, email, ...pageTypes } = PAGE_TYPE

	// Une charte déjà publiée disparaît des choix, sauf si c'est celle qu'on édite.
	const selectableTypes = $derived(
		Object.entries(
			charterAlreadyExist && page.type !== 'charter' ? pageTypes : { charter, ...pageTypes }
		).map(([value, option]) => ({ value: value as Page['type'], ...option }))
	)
	const selectableStates = Object.entries(PAGE_STATES).map(([value, option]) => ({
		value: value as PageState,
		...option,
	}))
	// L'accueil et les modèles de courriel sont toujours visibles, et ne changent pas de type:
	// ni l'un ni l'autre de ces deux champs ne se règle sur eux.
	const isFixed = $derived(page.type === 'home' || page.type === 'email')
	// Dérivés assignables: le choix est soumis avant que le serveur ne réponde, et `page`
	// change d'une publication à l'autre sans que le composant soit remonté.
	let pageType = $derived(page.type)
	let pageState = $derived(page.state)
	let inputTextRich: InputTextRich = $state()!
	const uid = $props.id()
	const formId = `${uid}-page`
	const deleteFormId = `${uid}-delete`
	const remoteForm = $derived(updatePage.for(page.id))

	let formElement = $state<HTMLFormElement>()
	let saveBar = $state<ReturnType<typeof SaveBar>>()
	// Le `reset()` natif ne restaure que les `defaultValue` du DOM: ni l'éditeur riche, ni les
	// champs cachés des sélecteurs. Les remonter les rétablit depuis `page`.
	let resetToken = $state(0)

	/**
	 * Ce que le `reset()` natif ne rend pas. Le type et le statut vivent dans l'état du champ
	 * distant, écrit au premier choix: le champ caché le relit plutôt que la valeur passée au
	 * remontage, et seul `set()` l'y rétablit.
	 */
	function restoreSelections() {
		pageType = page.type
		pageState = page.state
		if (isFixed) return
		remoteForm.fields.type.set(page.type)
		remoteForm.fields.state.set(page.state)
	}

	let pagePath = $derived(
		page.type === 'home'
			? eventPath('')
			: eventPath('/[pagePath]', { pagePath: normalizePath(page.title) })
	)
</script>

<!-- HTML interdit les <form> imbriqués: ce formulaire vide n'existe que pour porter l'action,
son bouton vit dans la barre d'actions du formulaire principal, associé par l'attribut `form`. -->
<form {...deletePage} id={deleteFormId} class="hidden"></form>

<!-- `id` après le spread: `enhance()` pose ses propres attributs, et les siens gagneraient. -->
<form
	{...remoteForm.enhance(
		enhanceForm({
			success: 'Page enregistrée',
			onsuccess: async () => {
				// Le titre et le type se répercutent sur la barre latérale et sur le chemin public.
				await invalidateAll()
				saveBar?.rebase()
			},
		})
	)}
	id={formId}
	bind:this={formElement}
	class="flex flex-col gap-2"
>
	{#key resetToken}
		<div class="flex flex-wrap gap-2 items-start">
			<InputString
				label="Titre"
				class="grow min-w-3xs"
				field={remoteForm.fields.title}
				value={page.title}
			/>

			<!-- Même structure que le `label` de l'`InputString` voisin, pour que les deux champs
			     s'alignent: fuma rend ses libellés dans un `fieldset.fieldset > label.label`. -->
			<fieldset class="fieldset">
				<span class="label">
					<span>Type de page</span>
					<PageTypeHelp />
				</span>

				{#if page.type === 'home'}
					<input type="hidden" name="type" value="home" />
					<div class="input">
						<home.icon size={21} class="opacity-70" />
						<span>{home.label}</span>
					</div>
				{:else if page.type === 'email'}
					<input type="hidden" name="type" value="email" />
					<div class="input">
						<email.icon size={21} class="opacity-70" />
						<span>{email.label}</span>
					</div>
				{:else}
					<InputSelect
						field={remoteForm.fields.type}
						items={selectableTypes}
						value={selectableTypes.find((option) => option.value === pageType)}
						onSelect={(option) => {
							if (!option) return
							pageType = option.value
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
			</fieldset>

			{#if !isFixed}
				<InputSelect
					label="Statut"
					field={remoteForm.fields.state}
					items={selectableStates}
					value={selectableStates.find((option) => option.value === pageState)}
					onSelect={(option) => {
						if (!option) return
						pageState = option.value
					}}
				>
					{#snippet selected(option)}
						<span class="flex items-center gap-2">
							<option.icon size={21} class={option.class} />
							<span>{option.label}</span>
						</span>
					{/snippet}
					{#snippet proposal(option)}
						<option.icon size={18} class={['shrink-0 self-start mt-1', option.class]} />
						<span class="flex flex-col py-1 max-w-56">
							<span>{option.label}</span>
							<span class="text-sm opacity-60 text-wrap">{option.description}</span>
						</span>
					{/snippet}
				</InputSelect>
			{/if}
		</div>
	{/key}

	<input type="hidden" name="id" value={page.id} />
	{#if isFixed}
		<input type="hidden" name="state" value="published" />
	{/if}
	{#if page.type !== 'email'}
		<input type="hidden" name="path" value={normalizePath(page.title)} />
	{/if}

	{#key `${page.id}:${resetToken}`}
		<InputTextRich
			bind:this={inputTextRich}
			key="content"
			value={page.content}
			onchange={() => saveBar?.refresh()}
			oninsertMedia={() =>
				mediaDrawer.open((media) =>
					inputTextRich.setImage({ src: `/media/${media.id}`, alt: media.name })
				)}
		/>
	{/key}

	<!-- Les refus métier (titre déjà pris, charte en double) remontent au niveau du formulaire -->
	{#each remoteForm.fields.issues() ?? [] as issue (issue.message)}
		<p class="text-error text-sm">{issue.message}</p>
	{/each}

	<div class="flex gap-2 items-center justify-between">
		{#if page.type !== 'home' && page.type !== 'email'}
			<ButtonDelete form={deleteFormId} formaction={deletePage.action} class="btn-sm" />
		{/if}

		{#if page.type !== 'email'}
			<a href={pagePath} class="flex items-center gap-1 link link-hover text-sm opacity-70 pr-4">
				<LinkIcon class="opacity-60" size={18} />
				<span>{pagePath}</span>
			</a>
		{/if}
	</div>
</form>

<SaveBar
	bind:this={saveBar}
	form={formElement}
	{formId}
	key={page.id}
	pending={remoteForm.pending > 0}
	onreset={() => {
		restoreSelections()
		resetToken++
	}}
/>

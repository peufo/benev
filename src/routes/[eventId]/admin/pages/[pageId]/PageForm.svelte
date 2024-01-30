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
	import { mdiLink } from '@mdi/js'
	import { PAGE_TYPE } from '$lib/constant'

	export let page: Page
	export let charterAlreadyExist: boolean

	const form = useForm()
	const { home, charter, ...pageTypes } = PAGE_TYPE

	$: pagePath = `${$eventPath}${page.type === 'home' ? '' : `/${normalizePath(page.title)}`}`
</script>

<form method="post" action="?/update_page" use:enhance={form.submit} class="flex flex-col gap-2">
	<div class="flex flex-wrap gap-2 items-end">
		<InputText label="Titre" key="title" value={page.title} />

		<FormControl label="Type de page">
			{#if page.type === 'home'}
				<div class="menu-item disabled border bordered h-12">
					<Icon path={home.icon} size={21} class="opacity-70" />
					<span>{home.label}</span>
				</div>
			{:else}
				<InputSelect
					key="type"
					noBtnClass
					class="menu-item border bordered h-12"
					options={charterAlreadyExist && page.type !== 'charter'
						? pageTypes
						: { charter, ...pageTypes }}
					value={page.type}
				/>
			{/if}
		</FormControl>
	</div>

	<input type="hidden" name="id" value={page.id} />
	<input type="hidden" name="path" value={normalizePath(page.title)} />

	<input type="hidden" name="eventId" value={page.eventId} />

	<InputTextRich key="content" value={page.content} classToolbar="top-14" />

	<div class="flex flex-row-reverse gap-2">
		<button class="btn">Sauvegarder</button>
		<DeleteButton formaction="?/delete_page" disabled={page.type === 'home'} />
		<div class="grow" />

		<a
			href={pagePath}
			class="flex items-center gap-1 mr-auto link link-hover text-sm opacity-70 pr-4"
		>
			<Icon path={mdiLink} class="opacity-60 -rotate-45" size={18} />
			<span>{pagePath}</span>
		</a>
	</div>
</form>

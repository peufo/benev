<script lang="ts">
	import type EditorJS from '@editorjs/editorjs'
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import type { Page } from '@prisma/client'

	import { useForm } from '$lib/form'
	import { InputText } from '$lib/material'
	import { normalizePath } from '$lib/normalizePath'
	import { eventPath } from '$lib/store'

	export let page: Page

	let holder: HTMLElement
	let editor: EditorJS | undefined = undefined
	const form = useForm()

	onMount(() => {
		let isReady = false
		Promise.all([import('@editorjs/editorjs'), import('./editorTools')]).then(
			([{ default: _EditorJS }, { tools }]) => {
				editor = new _EditorJS({
					holder,
					tools,
					placeholder: 'Rédige ta page ici',
					data: page.content && JSON.parse(page.content),
					onChange: async () => {
						if (!editor) return
						const data = await editor.save()
						page.content = JSON.stringify(data)
					},
					onReady: () => {
						isReady = true
					},
				})
			}
		)

		return async () => {
			if (editor && isReady) editor.destroy()
		}
	})

	$: pagePath = `${$eventPath}${page.isIndex ? '' : `/${normalizePath(page.title)}`}`
</script>

<form method="post" action="?/update_page" use:enhance={form.submit} class="flex flex-col gap-2">
	<div class="flex flex-wrap gap-4">
		<InputText
			key="title"
			bind:value={page.title}
			label=""
			input={{ placeholder: 'Titre de la page' }}
			class="max-w-xs"
		/>

		<a href={pagePath} class="link link-hover pt-7">
			{pagePath}
		</a>
	</div>

	<input type="hidden" name="id" value={page.id} />
	<input type="hidden" name="path" value={normalizePath(page.title)} />
	<input type="hidden" name="content" value={page.content} />
	<input type="hidden" name="eventId" value={page.eventId} />

	<div class="input input-bordered min-h-[555px] overflow-auto prose max-w-none">
		<div bind:this={holder} />
	</div>

	<div class="flex flex-row-reverse gap-2">
		<button class="btn">Valider</button>
		<button
			class="btn btn-outline btn-error"
			class:btn-disabled={page.isIndex}
			formaction="?/delete_page">Supprimer</button
		>
	</div>
</form>

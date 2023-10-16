<script lang="ts">
	import type EditorJS from '@editorjs/editorjs'
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import type { Page } from '@prisma/client'

	import { useForm } from '$lib/form'
	import { DeleteButton, Icon, InputText } from '$lib/material'
	import { normalizePath } from '$lib/normalizePath'
	import { eventPath } from '$lib/store'
	import { mdiLink } from '@mdi/js'

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

<form
	method="post"
	action="?/update_page"
	use:enhance={form.submit}
	class="flex flex-col gap-2 mt-4"
>
	<div class="flex flex-wrap gap-2 items-center">
		<span
			contenteditable="true"
			class="font-medium text-lg py-1 px-4 grow rounded-lg"
			bind:innerText={page.title}
		/>
		<input type="hidden" name="title" value={page.title} />

		<a href={pagePath} class="link link-hover text-sm flex opacity-70 pr-4">
			<Icon path={mdiLink} class="opacity-60 -rotate-45" size={18} />
			<span>{pagePath}</span>
		</a>
	</div>

	<input type="hidden" name="id" value={page.id} />
	<input type="hidden" name="path" value={normalizePath(page.title)} />
	<input type="hidden" name="content" value={page.content} />
	<input type="hidden" name="eventId" value={page.eventId} />

	<div class="input input-bordered prose max-w-none h-max">
		<div bind:this={holder} />
	</div>

	<div class="flex flex-row-reverse gap-2">
		<button class="btn">Sauvegarder</button>
		<DeleteButton formaction="?/delete_page" disabled={page.isIndex} />
	</div>
</form>

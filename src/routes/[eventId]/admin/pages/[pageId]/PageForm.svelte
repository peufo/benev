<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Page } from '@prisma/client'

	import { useForm } from '$lib/validation'
	import { DeleteButton, Icon, InputTextRich } from '$lib/material'
	import { normalizePath } from '$lib/normalizePath'
	import { eventPath } from '$lib/store'
	import { mdiLink } from '@mdi/js'

	export let page: Page

	const form = useForm()

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

	<input type="hidden" name="eventId" value={page.eventId} />

	<InputTextRich key="content" value={page.content} classToolbar="top-14" />

	<div class="flex flex-row-reverse gap-2">
		<button class="btn">Sauvegarder</button>
		<DeleteButton formaction="?/delete_page" disabled={page.isIndex} />
	</div>
</form>

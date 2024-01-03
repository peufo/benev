<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { mdiLinkVariant } from '@mdi/js'
	import { Dialog, InputText } from '$lib/material'

	import { z } from '$lib/validation'
	import ToolMark from './ToolMark.svelte'

	export let editor: Editor
	let dialogLink: HTMLDialogElement
	let linkHref = ''
	let linkError = ''

	async function handleNewLink() {
		if (!linkHref) {
			linkError = 'URL requis'
			return
		}

		const isEmail = z.string().email().safeParse(linkHref)
		if (isEmail.success) linkHref = 'mailto:' + linkHref
		else if (!linkHref.match(/^http(s)?:\/\//)) {
			linkHref = 'https://' + linkHref
		}

		const isUrl = z.string().url().safeParse(linkHref)
		if (!isUrl.success) {
			linkError = 'URL invalide'
			return
		}

		editor.chain().focus().setLink({ href: linkHref }).run()
		dialogLink.close()
	}

	function handleRemoveLink() {
		editor.chain().focus().unsetLink().run()
		dialogLink.close()
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter') return
		event.preventDefault()
		handleNewLink()
	}
</script>

<ToolMark
	{editor}
	key="link"
	label="Lien"
	icon={mdiLinkVariant}
	action={() => {
		const firstChild = editor.state.selection.content().content.firstChild
		linkHref = editor.getAttributes('link').href || firstChild?.textContent || ''
		dialogLink.showModal()
	}}
/>

<Dialog bind:dialog={dialogLink}>
	<h3 slot="header" class="title">Éditer un lien</h3>
	<div class="flex flex-col gap-2">
		<InputText bind:value={linkHref} bind:error={linkError} on:keydown={handleKeyDown} />
		<div class="flex flex-row-reverse gap-2">
			<button type="button" class="btn" on:click={handleNewLink}> Valider </button>
			<button type="button" class="btn btn-ghost text-error" on:click={handleRemoveLink}>
				Supprimer
			</button>
		</div>
	</div>
</Dialog>

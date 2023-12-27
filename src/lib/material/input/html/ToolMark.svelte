<script lang="ts">
	import { Editor } from '@tiptap/core'
	import { mdiFormatBold, mdiFormatItalic, mdiLinkVariant } from '@mdi/js'
	import { Dialog, Icon, InputText } from '$lib/material'
	import { tip } from '$lib/action'
	import { z } from '$lib/validation'

	export let editor: Editor
	let dialogLink: HTMLDialogElement
	let linkHref = ''
	let linkError = ''

	type ToolFormat = {
		key: string
		label: string
		icon: string
		action: () => void
		enableKey?: string
	}

	const tools: ToolFormat[] = [
		{
			key: 'bold',
			label: 'Gras (Ctrl+B)',
			icon: mdiFormatBold,
			action: () => editor.chain().focus().toggleBold().run(),
		},
		{
			key: 'italic',
			label: 'Italic (Ctrl+C)',
			icon: mdiFormatItalic,
			action: () => editor.chain().focus().toggleItalic().run(),
		},
		{
			key: 'link',
			label: 'Lien',
			icon: mdiLinkVariant,
			action: () => {
				const firstChild = editor.state.selection.content().content.firstChild
				linkHref = editor.getAttributes('link').href || firstChild?.textContent || ''
				dialogLink.showModal()
			},
		},
	]

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
</script>

{#each tools as tool}
	{@const isActive = editor.isActive(tool.key)}

	<button
		type="button"
		use:tip={{ content: tool.label, arrow: true }}
		class="menu-item {isActive ? 'bg-base-200/60' : ''}"
		on:click={tool.action}
	>
		<Icon path={tool.icon} size={19} class={isActive ? 'opacity-90' : 'opacity-70'} />
	</button>
{/each}

<Dialog bind:dialog={dialogLink}>
	<h3 slot="header" class="title">Ajouter un lien</h3>
	<div class="flex flex-col gap-2">
		<InputText bind:value={linkHref} bind:error={linkError} />
		<div class="flex flex-row-reverse gap-2">
			<button type="button" class="btn" on:click={handleNewLink}> Valider </button>
			<button type="button" class="btn btn-ghost text-error" on:click={handleRemoveLink}>
				Supprimer
			</button>
		</div>
	</div>
</Dialog>

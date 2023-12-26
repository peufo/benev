<script lang="ts">
	import { Editor } from '@tiptap/core'
	import {
		mdiFormatBold,
		mdiFormatItalic,
		mdiLinkVariant,
		mdiFormatColorText,
		mdiFormatColorFill,
	} from '@mdi/js'
	import { Icon } from '$lib/material'
	import { tip } from '$lib/action'
	import ToolFormatColor from './ToolFormatColor.svelte'

	export let editor: Editor

	type ToolFormat = {
		key: string
		label: string
		icon: string
		action: () => void
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
			label: 'Ajouter un lien',
			icon: mdiLinkVariant,
			action: () => {},
		},
	]

	function handleClick(tool: ToolFormat) {
		tool.action()
	}
</script>

{#each tools as tool}
	{@const isActive = editor.isActive(tool.key)}

	<button
		type="button"
		use:tip={{ content: tool.label, arrow: true }}
		class="menu-item {isActive ? 'bg-base-200/60' : ''}"
		on:click={() => handleClick(tool)}
	>
		<Icon path={tool.icon} size={19} class={isActive ? 'opacity-90' : 'opacity-70'} />
	</button>
{/each}

<ToolFormatColor icon={mdiFormatColorText} label="Couleur du text" />
<ToolFormatColor icon={mdiFormatColorFill} label="Couleur du fond" />

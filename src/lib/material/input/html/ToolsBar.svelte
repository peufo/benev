<script lang="ts">
	import { Editor } from '@tiptap/core'
	import { mdiFormatBold, mdiFormatColorFill, mdiFormatColorText, mdiFormatItalic } from '@mdi/js'

	import ToolMenuNode from './ToolMenuNode.svelte'
	import ToolMark from './ToolMark.svelte'
	import ToolMarkColor from './ToolMarkColor.svelte'
	import ToolMarkLink from './ToolMarkLink.svelte'
	import ToolMenuAlign from './ToolMenuAlign.svelte'

	export let editor: Editor
</script>

<div class="flex p-1 border-b overflow-auto">
	<ToolMenuNode {editor} />
	<ToolMenuAlign {editor} />
	<div class="border border-y-0 border-l-0 mx-1 my-auto h-6" />

	<ToolMark
		{editor}
		key="bold"
		label="Gras (Ctrl+B)"
		icon={mdiFormatBold}
		action={() => editor.chain().focus().toggleBold().run()}
	/>
	<ToolMark
		{editor}
		key="italic"
		label="Italic (Ctrl+C)"
		icon={mdiFormatItalic}
		action={() => editor.chain().focus().toggleItalic().run()}
	/>
	<ToolMarkLink {editor} />
	<ToolMarkColor
		icon={mdiFormatColorText}
		label="Couleur du text"
		color={editor.getAttributes('textStyle').color || '#000000'}
		setColor={editor.commands.setColor}
	/>
	<ToolMarkColor
		icon={mdiFormatColorFill}
		label="Couleur du fond"
		color={editor.getAttributes('highlight').color || '#e51f68'}
		setColor={(color) => editor.commands.setHighlight({ color })}
	/>

	<div class="border border-y-0 border-l-0 mx-1 my-auto h-6" />
</div>

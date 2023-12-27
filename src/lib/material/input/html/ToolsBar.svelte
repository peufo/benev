<script lang="ts">
	import { Editor } from '@tiptap/core'
	import ToolNode from './ToolNode.svelte'
	import ToolMark from './ToolMark.svelte'
	import ToolMarkColor from './ToolMarkColor.svelte'
	import { mdiFormatBold, mdiFormatColorFill, mdiFormatColorText, mdiFormatItalic } from '@mdi/js'
	import ToolMarkLink from './ToolMarkLink.svelte'

	export let editor: Editor
</script>

<div class="flex p-1 border-b">
	<ToolNode {editor} />
	<div class="border border-y-0 border-l-0 mx-1" />
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
	<ToolMarkColor icon={mdiFormatColorText} label="Couleur du text" />
	<ToolMarkColor icon={mdiFormatColorFill} label="Couleur du fond" />
</div>

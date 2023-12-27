<script lang="ts">
	import { Editor } from '@tiptap/core'
	import ToolNode from './ToolNode.svelte'
	import ToolMark from './ToolMark.svelte'
	import ToolMarkColor from './ToolMarkColor.svelte'
	import { mdiFormatColorFill, mdiFormatColorText } from '@mdi/js'

	export let editor: Editor
</script>

<div class="flex p-1 border-b">
	<ToolNode {editor} />
	<div class="border border-y-0 border-l-0 mx-1" />
	<ToolMark {editor} />
	<ToolMarkColor icon={mdiFormatColorText} label="Couleur du text" />
	<ToolMarkColor icon={mdiFormatColorFill} label="Couleur du fond" />
</div>

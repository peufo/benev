<script lang="ts">
	import { Editor } from '@tiptap/core'
	import ToolBlock from './ToolBlock.svelte'
	import ToolSize from './ToolSize.svelte'
	import ToolFormat from './ToolFormat.svelte'

	export let editor: Editor
</script>

<div class="flex p-1 border-b">
	<ToolBlock {editor} />
	<ToolSize />
	<ToolFormat {editor} />
</div>

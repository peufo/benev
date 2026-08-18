<script lang="ts">
	import { BaselineIcon, BoldIcon, ItalicIcon, PaintBucketIcon } from '@lucide/svelte'
	import type { Editor } from '@tiptap/core'

	import ToolMenuNode from '$lib/ui/textRich/ToolMenuNode.svelte'
	import ToolMark from '$lib/ui/textRich/ToolMark.svelte'
	import ToolMarkColor from '$lib/ui/textRich/ToolMarkColor.svelte'
	import ToolMarkLink from '$lib/ui/textRich/ToolMarkLink.svelte'
	import ToolMenuAlign from '$lib/ui/textRich/ToolMenuAlign.svelte'
	import ToolMenuInsert from '$lib/ui/textRich/ToolMenuInsert.svelte'

	interface Props {
		editor: Editor
		class?: string
		/** Remplacent les évènements de la version Svelte 4. */
		oninsertMedia?: () => void
	}

	let { editor, class: klass = '', oninsertMedia }: Props = $props()
</script>

{#snippet separator()}
	<div class="mx-1 my-auto h-6 border border-y-0 border-l-0 border-soft"></div>
{/snippet}

<div
	class={[
		'sticky top-0 z-10 overflow-y-visible',
		'rounded-t-field border-b border-soft bg-base-100',
		klass,
	]}
>
	<div class="flex overflow-x-auto p-2">
		<ToolMenuNode {editor} />
		<ToolMenuAlign {editor} />
		{@render separator()}
		<ToolMark
			{editor}
			key="bold"
			label="Gras (Ctrl+B)"
			icon={BoldIcon}
			action={() => editor.chain().focus().toggleBold().run()}
		/>
		<ToolMark
			{editor}
			key="italic"
			label="Italic (Ctrl+C)"
			icon={ItalicIcon}
			action={() => editor.chain().focus().toggleItalic().run()}
		/>
		<ToolMarkLink {editor} />
		<ToolMarkColor
			icon={BaselineIcon}
			label="Couleur du text"
			color={editor.getAttributes('textStyle').color || '#000000'}
			setColor={editor.commands.setColor}
		/>
		<ToolMarkColor
			icon={PaintBucketIcon}
			label="Couleur du fond"
			color={editor.getAttributes('highlight').color || '#e51f68'}
			setColor={(color) => editor.commands.setHighlight({ color })}
		/>
		{@render separator()}
		<ToolMenuInsert {editor} {oninsertMedia} />
	</div>
</div>

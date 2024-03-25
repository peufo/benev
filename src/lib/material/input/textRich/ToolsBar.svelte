<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { mdiFormatBold, mdiFormatColorFill, mdiFormatColorText, mdiFormatItalic } from '@mdi/js'

	import { SelectMedia } from '$lib/material'
	import ToolMenuNode from './ToolMenuNode.svelte'
	import ToolMark from './ToolMark.svelte'
	import ToolMarkColor from './ToolMarkColor.svelte'
	import ToolMarkLink from './ToolMarkLink.svelte'
	import ToolMenuAlign from './ToolMenuAlign.svelte'
	import ToolMenuInsert from './ToolMenuInsert.svelte'

	export let editor: Editor
	let klass = ''
	export { klass as class }

	let selectMedia: SelectMedia
</script>

<div
	class="
		 border-b overflow-y-visible bg-base-100 z-10 rounded-t-xl sticky top-0
		{klass}
	"
>
	<div class="flex p-2 overflow-x-auto">
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

		<ToolMenuInsert
			{editor}
			on:insertMedia={() => selectMedia.show()}
		/>
	</div>
</div>

<SelectMedia
	bind:this={selectMedia}
	on:select={({ detail }) => {
		const src = `/media/${detail.id}`
		editor.commands.setImage({ src, alt: detail.name })
	}}
/>

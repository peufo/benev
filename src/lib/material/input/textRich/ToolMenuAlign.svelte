<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import {
		mdiAlignHorizontalLeft,
		mdiAlignHorizontalCenter,
		mdiAlignHorizontalRight,
		mdiFormatIndentIncrease,
		mdiFormatIndentDecrease,
	} from '@mdi/js'

	import ToolMenu from './ToolMenu.svelte'

	export let editor: Editor
</script>

<ToolMenu
	{editor}
	hideLabel
	tools={[
		{
			attributes: { textAlign: 'left' },
			label: 'Aligner à gauche',
			icon: mdiAlignHorizontalLeft,
			action: () => editor.commands.setTextAlign('left'),
		},
		{
			attributes: { textAlign: 'center' },
			label: 'Aligner au centre',
			icon: mdiAlignHorizontalCenter,
			action: () => editor.commands.setTextAlign('center'),
		},
		{
			attributes: { textAlign: 'right' },
			label: 'Aligner à droite',
			icon: mdiAlignHorizontalRight,
			action: () => editor.commands.setTextAlign('right'),
		},
		{
			newSection: true,
			label: 'Retrait à droite',
			icon: mdiFormatIndentIncrease,
			action: () => editor.commands.indent(),
		},
		{
			label: 'Retrait à droite',
			icon: mdiFormatIndentDecrease,
			action: () => editor.commands.outdent(),
		},
	]}
/>

<script lang="ts">
	import { Editor } from '@tiptap/core'
	import {
		mdiAlignHorizontalLeft,
		mdiAlignHorizontalCenter,
		mdiAlignHorizontalRight,
	} from '@mdi/js'

	import ToolMenu from './ToolMenu.svelte'

	export let editor: Editor
</script>

<ToolMenu
	{editor}
	hideLabel
	tools={[
		{
			key: 'textAlign',
			attributes: { textAlign: 'left' },
			label: 'Aligner à gauche',
			icon: mdiAlignHorizontalLeft,
			action: () => editor.commands.setTextAlign('left'),
		},
		{
			key: 'heading',
			attributes: { textAlign: 'center' },
			label: 'Aligner au centre',
			icon: mdiAlignHorizontalCenter,
			action: () => editor.commands.setTextAlign('center'),
		},
		{
			key: 'heading',
			attributes: { textAlign: 'right' },
			label: 'Aligner à droite',
			icon: mdiAlignHorizontalRight,
			action: () => editor.commands.setTextAlign('right'),
		},
	]}
/>

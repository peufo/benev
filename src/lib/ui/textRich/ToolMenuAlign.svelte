<script lang="ts">
	import {
		TextAlignCenterIcon,
		TextAlignStartIcon,
		TextAlignEndIcon,
		ListIndentDecreaseIcon,
		ListIndentIncreaseIcon,
	} from '@lucide/svelte'
	import type { Editor } from '@tiptap/core'

	import ToolMenu from '#lib/ui/textRich/ToolMenu.svelte'

	interface Props {
		editor: Editor
	}

	let { editor }: Props = $props()
</script>

<ToolMenu
	{editor}
	hideLabel
	tools={[
		{
			attributes: { textAlign: 'left' },
			label: 'Aligner à gauche',
			icon: TextAlignStartIcon,
			action: () => editor.commands.setTextAlign('left'),
		},
		{
			attributes: { textAlign: 'center' },
			label: 'Aligner au centre',
			icon: TextAlignCenterIcon,
			action: () => editor.commands.setTextAlign('center'),
		},
		{
			attributes: { textAlign: 'right' },
			label: 'Aligner à droite',
			icon: TextAlignEndIcon,
			action: () => editor.commands.setTextAlign('right'),
		},
		{
			newSection: true,
			label: 'Retrait à droite',
			icon: ListIndentIncreaseIcon,
			action: () => editor.commands.indent(),
		},
		{
			label: 'Retrait à gauche',
			icon: ListIndentDecreaseIcon,
			action: () => editor.commands.outdent(),
		},
	]}
/>

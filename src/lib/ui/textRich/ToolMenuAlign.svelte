<script lang="ts">
	import {
		AlignCenterIcon,
		AlignLeftIcon,
		AlignRightIcon,
		IndentDecreaseIcon,
		IndentIncreaseIcon,
	} from '@lucide/svelte'
	import type { Editor } from '@tiptap/core'

	import ToolMenu from '$lib/ui/textRich/ToolMenu.svelte'

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
			icon: AlignLeftIcon,
			action: () => editor.commands.setTextAlign('left'),
		},
		{
			attributes: { textAlign: 'center' },
			label: 'Aligner au centre',
			icon: AlignCenterIcon,
			action: () => editor.commands.setTextAlign('center'),
		},
		{
			attributes: { textAlign: 'right' },
			label: 'Aligner à droite',
			icon: AlignRightIcon,
			action: () => editor.commands.setTextAlign('right'),
		},
		{
			newSection: true,
			label: 'Retrait à droite',
			icon: IndentIncreaseIcon,
			action: () => editor.commands.indent(),
		},
		{
			label: 'Retrait à gauche',
			icon: IndentDecreaseIcon,
			action: () => editor.commands.outdent(),
		},
	]}
/>

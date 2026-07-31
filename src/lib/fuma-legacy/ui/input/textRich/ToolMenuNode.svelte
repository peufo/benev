<script lang="ts">
	import {
		AlignLeftIcon,
		Heading1Icon,
		Heading2Icon,
		Heading3Icon,
		ListIcon,
		ListOrderedIcon,
	} from '@lucide/svelte'
	import type { Editor } from '@tiptap/core'

	import ToolMenu from '$lib/fuma-legacy/ui/input/textRich/ToolMenu.svelte'

	interface Props {
		editor: Editor
	}

	let { editor }: Props = $props()
</script>

<ToolMenu
	{editor}
	tools={[
		{
			key: 'paragraph',
			label: 'Texte',
			icon: AlignLeftIcon,
			action: () => editor.commands.setParagraph(),
		},
		{
			key: 'heading',
			attributes: { level: 1 },
			label: 'Titre 1',
			icon: Heading1Icon,
			action: () => editor.commands.setHeading({ level: 1 }),
		},
		{
			key: 'heading',
			attributes: { level: 2 },
			label: 'Titre 2',
			icon: Heading2Icon,
			action: () => editor.commands.setHeading({ level: 2 }),
		},
		{
			key: 'heading',
			attributes: { level: 3 },
			label: 'Titre 3',
			icon: Heading3Icon,
			action: () => editor.commands.setHeading({ level: 3 }),
		},
		{
			key: 'orderedList',
			label: 'Liste numéroter',
			icon: ListOrderedIcon,
			action: () => editor.commands.toggleOrderedList(),
		},
		{
			key: 'bulletList',
			label: 'Liste à puces',
			icon: ListIcon,
			action: () => editor.commands.toggleBulletList(),
		},
	]}
/>

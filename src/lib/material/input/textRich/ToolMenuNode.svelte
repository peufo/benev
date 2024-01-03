<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import {
		mdiText,
		mdiFormatListBulleted,
		mdiFormatListNumbered,
		mdiFormatHeader1,
		mdiFormatHeader3,
		mdiFormatHeader2,
	} from '@mdi/js'

	import ToolMenu from './ToolMenu.svelte'

	export let editor: Editor
</script>

<ToolMenu
	{editor}
	tools={[
		{
			key: 'paragraph',
			label: 'Texte',
			icon: mdiText,
			action: () => editor.commands.setParagraph(),
		},
		{
			key: 'heading',
			attributes: { level: 1 },
			label: 'Titre 1',
			icon: mdiFormatHeader1,
			action: () => editor.commands.setHeading({ level: 1 }),
		},
		{
			key: 'heading',
			attributes: { level: 2 },
			label: 'Titre 2',
			icon: mdiFormatHeader2,
			action: () => editor.commands.setHeading({ level: 2 }),
		},
		{
			key: 'heading',
			attributes: { level: 3 },
			label: 'Titre 3',
			icon: mdiFormatHeader3,
			action: () => editor.commands.setHeading({ level: 3 }),
		},
		{
			key: 'orderedList',
			label: 'Liste numéroter',
			icon: mdiFormatListNumbered,
			action: () => editor.commands.toggleOrderedList(),
		},
		{
			key: 'bulletList',
			label: 'Liste à puces',
			icon: mdiFormatListBulleted,
			action: () => editor.commands.toggleBulletList(),
		},
	]}
/>

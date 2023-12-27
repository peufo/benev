<script lang="ts">
	import { Editor } from '@tiptap/core'
	import {
		mdiText,
		mdiChevronDown,
		mdiFormatListBulleted,
		mdiFormatListNumbered,
		mdiFormatHeader1,
		mdiFormatHeader3,
		mdiFormatHeader2,
	} from '@mdi/js'
	import { Icon, DropDown } from '$lib/material'

	export let editor: Editor

	type Tool = {
		key: string
		attributes?: {}
		label: string
		icon: string
		action: () => unknown
	}

	let dropdown: DropDown

	const tools: Tool[] = [
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
			label: 'Liste',
			icon: mdiFormatListBulleted,
			action: () => editor.commands.toggleBulletList(),
		},
	]

	function handleClick(tool: Tool) {
		tool.action()
		dropdown.hide()
	}

	$: toolSelected = tools.find((t) => editor.isActive(t.key, t.attributes)) || tools[0]
</script>

<DropDown hideOnBlur bind:this={dropdown}>
	<button slot="activator" type="button" class="menu-item gap-2">
		<Icon path={toolSelected.icon} class="opacity-70" />
		<span class="font-light">{toolSelected.label}</span>
		<Icon path={mdiChevronDown} size={20} class="translate-y-[1px] opacity-70" />
	</button>

	{#each tools as tool}
		<button type="button" class="menu-item w-full" on:click={() => handleClick(tool)}>
			<Icon path={tool.icon} class="opacity-70" />
			<span>
				{tool.label}
			</span>
		</button>
	{/each}
</DropDown>

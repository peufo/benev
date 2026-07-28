<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import type { Editor } from '@tiptap/core'
	import { mdiPlus, mdiMinus, mdiImageOutline, mdiYoutube, mdiAt } from '@mdi/js'

	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import ToolMenu from '$lib/fuma/ui/input/textRich/ToolMenu.svelte'
	import { suggestionItems } from '$lib/fuma/ui/input/textRich/suggestion.js'

	interface Props {
		editor: Editor;
	}

	let { editor }: Props = $props();

	const dispatch = createEventDispatcher<{ insertMedia: void }>()
</script>

<ToolMenu
	{editor}
	tools={[
		{
			label: 'Séparateur',
			icon: mdiMinus,
			action: () => editor.commands.setHorizontalRule(),
		},
		{
			label: 'Image',
			icon: mdiImageOutline,
			action: () => dispatch('insertMedia'),
		},
		{
			label: 'Vidéo',
			icon: mdiYoutube,
			action: () => {
				const src = prompt('Lien youtube')
				if (!src) return
				editor.commands.setYoutubeVideo({ src })
			},
		},
		{
			label: 'Valeur dynamic',
			icon: mdiAt,
			disable: !$suggestionItems.length,
			action: () => {
				const { from } = editor.state.selection
				const lastChar = editor.state.doc.textBetween(from - 1, from)
				const charToAdd = lastChar === '' || lastChar === ' ' ? '@' : ' @'
				editor.chain().insertContent(charToAdd).focus().run()
			},
		},
	]}
	hideLabel
>
	{#snippet activator()}
	
			<Icon path={mdiPlus} size={20} class="opacity-70" />
		
	{/snippet}
</ToolMenu>

<script lang="ts">
	import { AtSignIcon, ImageIcon, MinusIcon, PlusIcon, VideoIcon } from '@lucide/svelte'
	import type { Editor } from '@tiptap/core'

	import ToolMenu from '$lib/ui/textRich/ToolMenu.svelte'
	import { suggestionItems } from '$lib/ui/textRich/suggestion.svelte.js'

	interface Props {
		editor: Editor
		/** Remplacent les évènements de la version Svelte 4. */
		oninsertMedia?: () => void
	}

	let { editor, oninsertMedia }: Props = $props()
</script>

<ToolMenu
	{editor}
	tools={[
		{
			label: 'Séparateur',
			icon: MinusIcon,
			action: () => editor.commands.setHorizontalRule(),
		},
		{
			label: 'Image',
			icon: ImageIcon,
			action: () => oninsertMedia?.(),
		},
		{
			label: 'Vidéo',
			icon: VideoIcon,
			action: () => {
				const src = prompt('Lien youtube')
				if (!src) return
				editor.commands.setYoutubeVideo({ src })
			},
		},
		{
			label: 'Valeur dynamic',
			icon: AtSignIcon,
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
		<PlusIcon size={20} class="opacity-70" />
	{/snippet}
</ToolMenu>

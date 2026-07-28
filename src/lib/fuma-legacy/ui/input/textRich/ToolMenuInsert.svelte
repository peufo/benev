<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { mdiPlus, mdiMinus, mdiImageOutline, mdiYoutube, mdiAt } from '@mdi/js'

	import { Icon } from '$lib/fuma-legacy/ui/icon/index.js'
	import ToolMenu from '$lib/fuma-legacy/ui/input/textRich/ToolMenu.svelte'
	import { suggestionItems } from '$lib/fuma-legacy/ui/input/textRich/suggestion.svelte.js'

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
			icon: mdiMinus,
			action: () => editor.commands.setHorizontalRule(),
		},
		{
			label: 'Image',
			icon: mdiImageOutline,
			action: () => oninsertMedia?.(),
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

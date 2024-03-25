<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { mdiPlus, mdiMinus, mdiImageOutline, mdiYoutube, mdiAt } from '@mdi/js'

	import { Icon } from '$lib/material'
	import ToolMenu from './ToolMenu.svelte'
	import { suggestionItems} from './suggestion'
	import { createEventDispatcher } from 'svelte'

	export let editor: Editor

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
		}, {
			label: 'Valeur dynamic',
			icon: mdiAt,
			disable: !$suggestionItems.length,
			action: () => {
				const {from} = editor.state.selection
				const lastChar = editor.state.doc.textBetween(from - 1, from)
				const charToAdd = lastChar === '' || lastChar === ' ' ? '@' : ' @'
				editor.chain().insertContent(charToAdd).focus().run()
			}
		}
	]}
	hideLabel
>
	<svelte:fragment slot="activator">
		<Icon path={mdiPlus} size={20} class="opacity-70" />
	</svelte:fragment>
</ToolMenu>

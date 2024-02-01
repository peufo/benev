<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { mdiPlus, mdiMinus, mdiImageOutline, mdiYoutube } from '@mdi/js'

	import { Icon } from '$lib/material'
	import ToolMenu from './ToolMenu.svelte'
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
		},
	]}
	hideLabel
>
	<svelte:fragment slot="activator">
		<Icon path={mdiPlus} size={20} class="opacity-70" />
	</svelte:fragment>
</ToolMenu>

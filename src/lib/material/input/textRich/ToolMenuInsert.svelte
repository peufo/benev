<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { mdiPlus, mdiMinus } from '@mdi/js'

	import ToolMenu from './ToolMenu.svelte'
	import { Icon } from '$lib/material'

	export let editor: Editor
</script>

<ToolMenu
	{editor}
	tools={[
		{
			label: 'Séparation horizontal',
			icon: mdiMinus,
			action: () => editor.commands.setHorizontalRule(),
		},
	]}
	hideLabel
>
	<svelte:fragment slot="activator">
		<Icon path={mdiPlus} size={20} class="opacity-70" />
	</svelte:fragment>
</ToolMenu>

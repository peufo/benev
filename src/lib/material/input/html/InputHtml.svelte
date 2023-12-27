<script lang="ts">
	import { onMount } from 'svelte'
	import { Editor } from '@tiptap/core'
	import StarterKit from '@tiptap/starter-kit'
	import Link from '@tiptap/extension-link'
	import ToolsBar from './ToolsBar.svelte'

	let element: HTMLDivElement
	let editor: Editor | null = null

	onMount(() => {
		editor = new Editor({
			element,
			content:
				'asdasddsasdsds<div>sdssds</div><div></div><div></div><div></div><div></div><div></div><div><div>ad</div><div>asda</div><div>sdasdasd</div><div>asd</div><div>asd</div><div>asdasdas</div><div>as</div></div>',
			editorProps: {
				attributes: {
					class: 'prose focus:outline-none',
				},
			},
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3] },
				}),
				Link.configure({
					protocols: ['tel', 'mailto'],
				}),
			],

			onTransaction() {
				editor = editor
			},
		})

		return () => {
			if (editor) editor.destroy()
		}
	})
</script>

<div class="border bordered rounded-xl">
	{#if editor}
		<ToolsBar {editor} />
	{/if}
	<div bind:this={element} class="p-2" />
</div>

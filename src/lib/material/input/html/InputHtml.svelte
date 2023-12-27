<script lang="ts">
	import { onMount } from 'svelte'
	import { Editor } from '@tiptap/core'
	import { extensions } from './extensions'

	import ToolsBar from './ToolsBar.svelte'
	import { debounce } from '$lib/debounce'
	import { jsonParse } from '$lib/jsonParse'

	export let value = ''
	export let key = ''
	export let valueAsHTML = false

	let element: HTMLDivElement
	let editor: Editor | null = null

	onMount(() => {
		const updateValue = debounce(() => {
			if (editor) value = valueAsHTML ? editor.getHTML() : JSON.stringify(editor.getJSON())
		}, 200)

		editor = new Editor({
			element,
			content: valueAsHTML ? value : jsonParse(value, '<p>parsing error</p>'),
			editorProps: {
				attributes: {
					class: 'prose max-w-none focus:outline-none',
				},
			},
			extensions,
			onTransaction() {
				editor = editor
				updateValue()
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

{#if key}
	<input type="hidden" name={key} {value} />
{/if}

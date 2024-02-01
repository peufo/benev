<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'
	import { Editor } from '@tiptap/core'
	import { extensions } from './extensions'

	import ToolsBar from './ToolsBar.svelte'
	import { debounce } from '$lib/debounce'
	import { jsonParse } from '$lib/jsonParse'

	export let value = ''
	export let key = ''
	export let valueAsHTML = false
	export let classToolbar = ''

	let element: HTMLDivElement
	let editor: Editor | null = null

	const dispatch = createEventDispatcher<{ change: void }>()

	onMount(() => {
		const updateValue = debounce(() => {
			if (!editor) return
			const newValue = valueAsHTML ? editor.getHTML() : JSON.stringify(editor.getJSON())
			if (newValue === value) return
			value = newValue
			dispatch('change')
		}, 120)

		editor = new Editor({
			element,
			content: valueAsHTML ? value : jsonParse(value, undefined),
			editorProps: {
				attributes: {
					class: 'prose max-w-[210mm] mx-auto focus:outline-none',
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

<div class="border bordered rounded-lg relative">
	{#if editor}
		<ToolsBar {editor} class={classToolbar} />
	{/if}
	<div bind:this={element} class="p-4 pb-10 min-h-[20rem]" />
</div>

{#if key}
	<input type="hidden" name={key} {value} />
{/if}

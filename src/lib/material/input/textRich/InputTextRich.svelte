<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte'
	import { Editor } from '@tiptap/core'

	import { debounce } from '$lib/debounce'
	import { jsonParse } from '$lib/jsonParse'
	import { extensions } from './extensions'
	import ToolsBar from './ToolsBar.svelte'

	export let value = ''
	export let key = ''
	export let classToolbar = ''

	let element: HTMLDivElement
	let editor: Editor | null = null

	const dispatch = createEventDispatcher<{ change: void }>()

	onMount(() => {
		initEditor()
		return () => {
			if (editor) editor.destroy()
		}
	})

	function initEditor() {
		const valueAsHtml = !value.startsWith('{') && value !== 'null'
		editor = new Editor({
			element,
			content: valueAsHtml ? value : jsonParse(value, undefined),
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
	}

	const updateValue = debounce(() => {
			if (!editor) return
			const newValue = JSON.stringify(editor.getJSON())
			console.log(newValue)
			if (newValue === value) return
			value = newValue
			dispatch('change')
		}, 120)

</script>

<div class="border bordered rounded-lg relative">
	{#if editor}
		<ToolsBar {editor} class={classToolbar}  />
	{/if}
	<div bind:this={element} class="p-4 pb-10 min-h-[20rem]" />
</div>

{#if key}
	<input type="hidden" name={key} {value} />
{/if}

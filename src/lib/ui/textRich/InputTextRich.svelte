<script lang="ts">
	import { onMount } from 'svelte'
	import { Editor } from '@tiptap/core'
	import debounce from 'debounce'

	import { jsonParse } from 'fuma'
	import ToolsBar from '$lib/ui/textRich/ToolsBar.svelte'
	import { extensions } from '$lib/ui/textRich/extensions.js'

	interface Props {
		/** Nom du champ caché portant la valeur. Vide, l'éditeur ne soumet rien. */
		key?: string
		value?: string
		classToolbar?: string
		onchange?: () => void
		oninsertMedia?: () => void
	}

	let {
		key = '',
		value = $bindable(''),
		classToolbar = '',
		onchange,
		oninsertMedia,
	}: Props = $props()

	let element: HTMLDivElement = $state()!
	let editor: Editor | null = $state(null)

	onMount(() => {
		initEditor()
		return () => {
			if (editor) editor.destroy()
		}
	})

	export function setImage(image: { src: string; alt: string }) {
		if (!editor) return false
		return editor.commands.setImage(image)
	}

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
			// La barre d'outils lit l'état de la sélection: elle suit toutes les transactions.
			onTransaction() {
				editor = editor
			},
			// La valeur ne suit que les transactions qui modifient le document. Sur `transaction`,
			// la normalisation du contenu chargé — un document vide sérialisé `'null'`, une page
			// écrite en HTML — passerait pour une saisie et signalerait une modification.
			onUpdate() {
				updateValue()
			},
		})
	}

	const updateValue = debounce(() => {
		if (!editor) return
		const newValue = JSON.stringify(editor.getJSON())
		if (newValue === value) return
		value = newValue
		onchange?.()
	}, 120)
</script>

<div class="relative rounded-field border border-hard">
	{#if editor}
		<ToolsBar {editor} class={classToolbar} {oninsertMedia} />
	{/if}
	<div bind:this={element} class="min-h-80 p-4 pb-10"></div>
</div>
{#if key}
	<input type="hidden" name={key} {value} />
{/if}

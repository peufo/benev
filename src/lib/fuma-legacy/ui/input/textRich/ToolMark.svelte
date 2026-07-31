<script lang="ts">
	import type { IconProps } from '@lucide/svelte'
	import type { Editor } from '@tiptap/core'
	import { tip } from 'fuma'
	import type { Component } from 'svelte'

	interface Props {
		editor: Editor
		key: string
		label: string
		icon: Component<IconProps>
		action: () => void
	}

	let { editor, key, label, icon: Icon, action }: Props = $props()

	let isActive = $derived(editor.isActive(key))
</script>

<button
	type="button"
	use:tip={{ content: label, arrow: true }}
	class="menu-item {isActive ? 'bg-base-200/60' : ''}"
	onclick={action}
>
	<Icon size={19} class={isActive ? 'opacity-90' : 'opacity-60'} />
</button>

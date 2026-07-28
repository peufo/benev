<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { Icon } from '$lib/fuma/ui/icon/index.js'
	import { tip } from '$lib/fuma/action/tip.js'

	interface Props {
		editor: Editor
		key: string
		label: string
		icon: string
		action: () => void
	}

	let { editor, key, label, icon, action }: Props = $props()

	let isActive = $derived(editor.isActive(key))
</script>

<button
	type="button"
	use:tip={{ content: label, arrow: true }}
	class="menu-item {isActive ? 'bg-base-200/60' : ''}"
	onclick={action}
>
	<Icon path={icon} size={19} class={isActive ? 'opacity-90' : 'opacity-60'} />
</button>

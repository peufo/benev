<script lang="ts">
	import type { Editor } from '@tiptap/core'
	import { Icon } from '$lib/material'
	import { tip } from '$lib/action'

	export let editor: Editor
	export let key: string
	export let label: string
	export let icon: string
	export let action: () => void

	$: isActive = editor.isActive(key)
</script>

<button
	type="button"
	use:tip={{ content: label, arrow: true }}
	class="menu-item {isActive ? 'bg-base-200/60' : ''}"
	on:click={action}
>
	<Icon path={icon} size={19} class={isActive ? 'opacity-90' : 'opacity-60'} />
</button>

<script lang="ts">
	import { getTextColor } from '$lib/utils'
	import { getNextColor } from './InputColorPalette.svelte'

	interface Props {
		name?: string
		label?: string
		value?: string
	}

	let { name = '', label = name, value = $bindable(getNextColor()) }: Props = $props()

	let input: HTMLInputElement = $state()!
</script>

<button
	type="button"
	style="background: {value}; color: {getTextColor(value)};"
	class="btn btn-sm"
	onclick={() => input.click()}
>
	<span class="lowercase">{label}</span>
	<input
		bind:value
		bind:this={input}
		{name}
		type="color"
		list="palette"
		class="absolute invisible left-0 -bottom-1"
	/>
</button>

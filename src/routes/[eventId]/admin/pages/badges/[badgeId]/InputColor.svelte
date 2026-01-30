<script lang="ts">
	import { getTextColor } from '$lib/utils'
	import { getNextColor } from './InputColorPalette.svelte'

	export let name = ''
	export let label = name
	export let value = getNextColor()

	let input: HTMLInputElement
</script>

<button
	type="button"
	style="background: {value}; color: {getTextColor(value)};"
	class="btn btn-sm"
	on:click={() => input.click()}
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

<script lang="ts">
	import { Icon } from '$lib/material'
	import { tip } from '$lib/action'

	export let icon: string
	export let label: string

	let color = ''
	let inputColor: HTMLInputElement
</script>

<div class="flex align-bottom">
	<input
		type="color"
		bind:value={color}
		class="w-0 h-0 border-none outline-none opacity-0 translate-y-8"
		bind:this={inputColor}
	/>
	<button
		type="button"
		class="menu-item gap-2"
		on:click={() => inputColor.click()}
		use:tip={{ content: label }}
	>
		<Icon path={icon} size={19} class="opacity-70" style="fill: {color};" />
	</button>
</div>

<!--

<button type="button" class="menu-item gap-2 {}">
	<Icon path={mdiFormatColorFill} class="opacity-70" />
	<Icon path={mdiChevronDown} size={20} class="translate-y-[1px] opacity-70" />
</button>
-->

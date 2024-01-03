<script lang="ts">
	import { Icon } from '$lib/material'
	import { tip } from '$lib/action'

	export let icon: string
	export let label: string
	export let color: string
	export let setColor: (color: string) => void

	let inputColor: HTMLInputElement

	function handleClick() {
		inputColor.click()
		setColor(color)
	}
</script>

<div class="flex align-bottom">
	<input
		type="color"
		tabindex="-1"
		bind:value={color}
		class="w-0 h-0 border-none outline-none opacity-0 translate-y-8"
		bind:this={inputColor}
		on:input={() => setColor(color)}
	/>
	<button type="button" class="menu-item gap-2" on:click={handleClick} use:tip={{ content: label }}>
		<div class="indicator">
			<span
				class="indicator-item badge badge-xs border transition-none scale-75"
				style:background={color}
			/>
			<Icon path={icon} size={19} class="opacity-70" />
		</div>
	</button>
</div>

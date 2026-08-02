<script lang="ts">
	import type { IconProps } from '@lucide/svelte'
	import type { Component } from 'svelte'
	import { tip } from 'fuma'

	interface Props {
		icon: Component<IconProps>
		label: string
		color: string
		setColor: (color: string) => void
	}

	let { icon: Icon, label, color = $bindable(), setColor }: Props = $props()

	let inputColor: HTMLInputElement = $state()!

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
		class="h-0 w-0 translate-y-8 border-none opacity-0 outline-none"
		bind:this={inputColor}
		oninput={() => setColor(color)}
	/>
	<button type="button" class="menu-item gap-2" onclick={handleClick} use:tip={{ content: label }}>
		<div class="indicator">
			<span
				class="badge indicator-item badge-xs scale-75 border transition-none"
				style:background={color}
			></span>
			<Icon size={19} class="opacity-70" />
		</div>
	</button>
</div>

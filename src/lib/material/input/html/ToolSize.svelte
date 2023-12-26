<script lang="ts">
	import { Icon, DropDown } from '$lib/material'
	import { mdiChevronDown, mdiFormatSize } from '@mdi/js'

	const sizes: number[] = [8, 9, 10, 11, 12, 14, 18, 24, 30, 36, 48, 60, 72, 96]
	let sizeSelected: number = sizes[0]

	let dropdown: DropDown
	function handleClick(size: number) {
		sizeSelected = size
		dropdown.hide()
	}

	const getLabel = (size: number) => `${size}px`
</script>

<DropDown hideOnBlur bind:this={dropdown}>
	<button slot="activator" type="button" class="menu-item gap-2">
		<Icon path={mdiFormatSize} class="opacity-70" size={20} />
		<span class="font-light">{getLabel(sizeSelected)}</span>
		<Icon path={mdiChevronDown} size={20} class="translate-y-[1px] opacity-70" />
	</button>

	{#each sizes as size}
		<button type="button" class="menu-item w-full" on:click={() => handleClick(size)}>
			{getLabel(size)}
		</button>
	{/each}
</DropDown>

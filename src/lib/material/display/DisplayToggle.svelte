<script lang="ts">
	import { mdiFormatListBulleted, mdiCardMultipleOutline } from '@mdi/js'
	import { display } from '$lib/store'
	import { Icon } from '$lib/material'

	type Display = 'list' | 'table'
	const tabs: ({value: Display, title: string, path: string})[] = [
		{ value: 'list', title: 'Affichage en cartes', path:  mdiCardMultipleOutline},
		{ value: 'table', title: 'Affichage en table', path: mdiFormatListBulleted },
	]

</script>

<div class="flex items-center border rounded-lg gap-[3px] p-[3px]">
	{#each tabs as { value, title, path }}
		<button
			on:click={() => display.set(value)}
			class="h-6 w-6 p-1 grid place-content-center rounded"
			class:bg-base-300={$display === value}
		>
			<Icon {path} {title} size={20} />
	</button>
	{/each}
</div>

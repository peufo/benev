<script lang="ts">
	import { mdiFormatListBulleted, mdiCardMultipleOutline } from '@mdi/js'
	import { display } from '$lib/store'
	import { Icon } from '$lib/material'

	type Display = 'list' | 'table'
	const tabs: { value: Display; title: string; path: string }[] = [
		{ value: 'list', title: 'Afficher des cartes', path: mdiCardMultipleOutline },
		{ value: 'table', title: 'Afficher une liste', path: mdiFormatListBulleted },
	]
</script>

<div class="flex items-center rounded-lg gap-[3px] p-1 bg-base-300">
	{#each tabs as { value, title, path }}
		{@const isActive = $display === value}
		<button
			on:click={() => display.set(value)}
			class="h-6 w-6 p-1 grid place-content-center rounded"
			class:bg-base-100={isActive}
			class:shadow={isActive}
		>
			<Icon {path} {title} size={18} class={isActive ? '' : 'opacity-60'} />
		</button>
	{/each}
</div>

<script lang="ts">
	import { mdiEyeCheckOutline, mdiEyeOutline } from '@mdi/js'
	import { onlyAvailable } from '$lib/store'
	import { Icon } from '$lib/material'

	const tabs: { value: boolean; title: string; path: string }[] = [
		{ value: true, title: "N'afficher que les disponibles", path: mdiEyeCheckOutline },
		{ value: false, title: 'Tout afficher', path: mdiEyeOutline },
	]
</script>

<div class="flex items-center border rounded-lg gap-[3px] p-[3px]">
	{#each tabs as { value, title, path }}
		{@const important = value}
		{@const active = $onlyAvailable === value}
		<button
			on:click={() => onlyAvailable.set(value)}
			class="h-6 w-6 p-1 grid place-content-center rounded"
			class:bg-base-300={!important && active}
			class:bg-primary={important && active}
		>
			<Icon {path} {title} size={20} active={important && active} />
		</button>
	{/each}
</div>

<script lang="ts">
	import {  mdiEyeCheckOutline, mdiEyeOutline } from '@mdi/js'
	import { onlyAvailable } from '$lib/store'
	import { Icon } from '$lib/material'

	
	const tabs: ({value: boolean, title: string, path: string})[] = [
		{ value: true, title: "N'afficher que les disponnibles", path:  mdiEyeCheckOutline},
		{ value: false, title: 'Tout afficher', path: mdiEyeOutline },
	]

</script>

<div class="flex items-center border rounded-lg gap-[3px] p-[3px]">
	{#each tabs as { value, title, path }}
		<button
			on:click={() => onlyAvailable.set(value)}
			class="h-6 w-6 p-1 grid place-content-center rounded"
			class:bg-base-300={$onlyAvailable === value}
		>
			<Icon {path} {title} size={20} />
	</button>
	{/each}
</div>

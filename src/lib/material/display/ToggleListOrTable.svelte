<script lang="ts">
	import { mdiFormatListBulleted, mdiCardMultipleOutline } from '@mdi/js'
	import { display } from '$lib/store'
	import { TabsSmall } from '$lib/material'

	type Display = 'list' | 'table'

	function handleClick(value: string) {
		display.set(value as Display)
	}
</script>

<TabsSmall
	options={[
		{ value: 'list', label: 'Cartes', icon: mdiCardMultipleOutline },
		{ value: 'table', label: 'Liste', icon: mdiFormatListBulleted },
	]}
	activeValue={$display}
	on:click={({ detail }) => handleClick(detail)}
/>

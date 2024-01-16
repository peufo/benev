<script lang="ts">
	import { mdiFormatListBulleted, mdiCardMultipleOutline } from '@mdi/js'
	import { TabsSmall } from '$lib/material'
</script>

<TabsSmall
	key="display"
	defaultValue="table"
	options={[
		{ value: 'list', label: 'Cartes', icon: mdiCardMultipleOutline },
		{ value: 'table', label: 'Liste', icon: mdiFormatListBulleted },
	]}
/>

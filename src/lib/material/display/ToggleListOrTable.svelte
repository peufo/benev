<script lang="ts">
	import { mdiFormatListBulleted, mdiCardMultipleOutline } from '@mdi/js'
	import { TabsIcon } from 'fuma'
</script>

<TabsIcon
	key="display"
	defaultValue="table"
	options={[
		{ value: 'list', label: 'Cartes', icon: mdiCardMultipleOutline },
		{ value: 'table', label: 'Liste', icon: mdiFormatListBulleted },
	]}
/>

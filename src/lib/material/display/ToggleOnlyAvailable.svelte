<script lang="ts">
	import { mdiEyeCheckOutline, mdiEyeOutline } from '@mdi/js'
	import { TabsSmall } from '$lib/material'
</script>

<TabsSmall
	key="onlyAvailable"
	defaultValue="false"
	options={[
		{ value: 'true', label: "N'afficher que les périodes disponibles", icon: mdiEyeCheckOutline },
		{ value: 'false', label: 'Tout afficher', icon: mdiEyeOutline },
	]}
/>

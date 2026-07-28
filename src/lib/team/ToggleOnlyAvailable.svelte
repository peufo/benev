<script lang="ts">
	import { mdiEyeCheckOutline, mdiEyeOutline } from '@mdi/js'
	import { TabsIcon } from '$lib/fuma'
</script>

<TabsIcon
	key="onlyAvailable"
	defaultValue="false"
	options={[
		{ value: 'true', label: "N'afficher que les périodes disponibles", icon: mdiEyeCheckOutline },
		{ value: 'false', label: 'Tout afficher', icon: mdiEyeOutline },
	]}
/>

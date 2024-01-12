<script lang="ts">
	import { mdiEyeCheckOutline, mdiEyeOutline } from '@mdi/js'
	import { onlyAvailable } from '$lib/store'
	import { TabsSmall } from '$lib/material'
</script>

<TabsSmall
	options={[
		{ value: 'true', label: "N'afficher que les périodes disponibles", icon: mdiEyeCheckOutline },
		{ value: 'false', label: 'Tout afficher', icon: mdiEyeOutline },
	]}
	activeValue={$onlyAvailable ? 'true' : 'false'}
	on:click={({ detail }) => onlyAvailable.set(detail === 'true')}
/>

<script lang="ts">
	import { EyeIcon, EyeOffIcon } from '@lucide/svelte'
	import { TabsIcon } from '$lib/ui'
</script>

<TabsIcon
	key="onlyAvailable"
	defaultValue="false"
	options={[
		{ value: 'true', label: "N'afficher que les périodes disponibles", icon: EyeOffIcon },
		{ value: 'false', label: 'Tout afficher', icon: EyeIcon },
	]}
/>

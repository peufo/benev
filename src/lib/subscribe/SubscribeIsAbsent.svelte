<script lang="ts">
	import { tip } from '$lib/action'
	import { Icon } from '$lib/material'
	import { mdiAlertOutline } from '@mdi/js'

	export let isAbsent: boolean
</script>

{#if isAbsent}
	<div use:tip={{ content: 'Absent à sa période de travail' }}>
		<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
	</div>
{/if}

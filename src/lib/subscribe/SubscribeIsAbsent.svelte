<script lang="ts">
	import { Icon, tip } from 'fuma'
	import { mdiAlertOutline } from '@mdi/js'

	export let isAbsent: boolean
</script>

{#if isAbsent}
	<div use:tip={{ content: 'Absent à sa période de travail' }}>
		<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
	</div>
{/if}

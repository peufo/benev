<script lang="ts">
	import { Icon } from '$lib/fuma-legacy'
	import { tip } from 'fuma'
	import { mdiAlertOutline } from '@mdi/js'

	interface Props {
		isAbsent: boolean
	}

	let { isAbsent }: Props = $props()
</script>

{#if isAbsent}
	<div use:tip={{ content: 'Absent à sa période de travail' }}>
		<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
	</div>
{/if}

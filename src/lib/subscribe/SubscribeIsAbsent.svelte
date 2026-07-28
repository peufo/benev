<script lang="ts">
	import { Icon, tip } from '$lib/fuma'
	import { mdiAlertOutline } from '@mdi/js'

	interface Props {
		isAbsent: boolean;
	}

	let { isAbsent }: Props = $props();
</script>

{#if isAbsent}
	<div use:tip={{ content: 'Absent à sa période de travail' }}>
		<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
	</div>
{/if}

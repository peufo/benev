<script lang="ts">
	import { TriangleAlertIcon } from '@lucide/svelte'
	import { tip } from 'fuma'

	interface Props {
		isAbsent: boolean
	}

	let { isAbsent }: Props = $props()
</script>

{#if isAbsent}
	<div use:tip={{ content: 'Absent à sa période de travail' }}>
		<TriangleAlertIcon class="text-warning" size={20} />
	</div>
{/if}

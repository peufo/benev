<script lang="ts">
	import { TriangleAlertIcon } from '@lucide/svelte'
	import { tip } from 'fuma'
	import type { Subscribe } from '@prisma/client'
	interface Props {
		subscribes: Subscribe[]
	}

	let { subscribes }: Props = $props()

	let nbAbsences = $derived(subscribes.filter((s) => s.isAbsent).length || 0)
</script>

{#if nbAbsences}
	{@const content = `Absent à ${nbAbsences} période${nbAbsences > 1 ? 's' : ''}`}
	<div use:tip={{ content }}>
		<TriangleAlertIcon class="text-warning" size={20} />
	</div>
{/if}

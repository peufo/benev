<script lang="ts">
	import { Icon } from '$lib/fuma-legacy'
	import { tip } from 'fuma'
	import { mdiAlertOutline } from '@mdi/js'
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
		<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
	</div>
{/if}

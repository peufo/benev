<script lang="ts">
	import { Icon, tip } from 'fuma'
	import { mdiAlertOutline } from '@mdi/js'
	import type { Subscribe } from '@prisma/client'
	export let subscribes: Subscribe[]

	$: nbAbsences = subscribes.filter((s) => s.isAbsent).length || 0
</script>

{#if nbAbsences}
	{@const content = `Absent à ${nbAbsences} période${nbAbsences > 1 ? 's' : ''}`}
	<div use:tip={{ content }}>
		<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
	</div>
{/if}

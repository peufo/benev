<script lang="ts">
	import { tip } from '$lib/action'
	import { Icon } from '$lib/material'
	import { mdiAlertOutline } from '@mdi/js'
	import type { Subscribe } from '@prisma/client'
	export let subscribes: Subscribe[]

	$: nbAbsences = subscribes.filter((s) => s.isAbsent).length
</script>

{#if nbAbsences}
	{@const content = `Absent à ${nbAbsences} période${nbAbsences > 1 ? 's' : ''}`}
	<div use:tip={{ content }}>
		<Icon path={mdiAlertOutline} class="fill-warning" size={20} />
	</div>
{/if}

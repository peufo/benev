<script lang="ts">
	import type { Event } from '@prisma/client'
	import { Infinity } from 'lucide-svelte'
	import { EVENT_TIER } from '$lib/constant'

	export let event: Event
	export let membersValided: number

	$: tier = EVENT_TIER[event.tier]
	$: max = tier.max
	$: ratio = max ? membersValided / max : 0
	$: status = ratio >= 0.9 ? 'error' : ratio >= 0.8 ? 'warning' : 'success'
	$: statusClass = {
		error: 'border-error bg-error/10 text-error',
		warning: 'border-warning bg-warning/10 text-warning',
		success: 'border-success bg-success/10 text-success',
	}[status]
</script>

<a
	href="/{event.id}/admin/quota"
	class="
		w-[58px] h-[58px] flex items-center justify-center shrink-0
		border-2 rounded-[15px]
		transition-transform duration-200 hover:scale-105
		{statusClass}
	"
	title="Plan {tier.label} — voir le quota"
>
	<span class="text-xs font-medium leading-none flex items-center gap-0.5">
		{membersValided} /
		{#if max !== null}
			{max}
		{:else}
			<Infinity size={14} />
		{/if}
	</span>
</a>

<script lang="ts">
	import { resolve } from '$app/paths'
	import type { Event } from '@prisma/client'
	import { InfinityIcon } from '@lucide/svelte'
	import { EVENT_TIER } from '$lib/constant'
	import { tip } from 'fuma'

	interface Props {
		event: Event
		membersValided: number
	}

	let { event, membersValided }: Props = $props()

	let tier = $derived(EVENT_TIER[event.tier])
	let max = $derived(tier.max)
	let ratio = $derived(max ? membersValided / max : 0)
	let status = $derived(ratio >= 0.9 ? 'error' : ratio >= 0.8 ? 'warning' : 'success')
	let statusClass = $derived(
		{
			error: 'border-error bg-error/10 text-error',
			warning: 'border-warning bg-warning/10 text-warning',
			success: 'border-success bg-success/10 text-success',
		}[status]
	)
</script>

<a
	href={resolve('/[eventId]/admin/quota', { eventId: event.id })}
	class="
		w-11 h-11 flex items-center justify-center shrink-0
		border-2 rounded-field -translate-x-px
		transition-transform duration-200 hover:scale-110
		{statusClass}
	"
	use:tip={{ content: `Plan ${tier.label} — voir le quota`, placement: 'bottom' }}
>
	<span class="text-xs font-medium leading-none flex items-center gap-0.5">
		{membersValided} /
		{#if max !== null}
			{max}
		{:else}
			<InfinityIcon size={14} />
		{/if}
	</span>
</a>

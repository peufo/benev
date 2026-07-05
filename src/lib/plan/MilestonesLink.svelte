<script lang="ts">
	import { formatDatetime } from '$lib/formatRange'
	import type { Milestone } from '@prisma/client'
	import type { Dayjs } from 'dayjs'
	import { urlParam } from 'fuma'
	import { PinIcon } from 'lucide-svelte'

	export let milestonesBefore: (Milestone & { time: Dayjs })[]
	export let milestonesAfter: (Milestone & { time: Dayjs })[]
</script>

<div class="flex gap-2 justify-between items-start sticky left-0 w-full p-2">
	<div class="grid grid-cols-3 gap-y-1 gap-x-2 items-center">
		{#each milestonesBefore as milestone (milestone.id)}
			<a
				class="badge badge-secondary badge-outline group hover:bg-secondary/10"
				href={$urlParam.with({ cursor: milestone.time.toJSON() })}
			>
				<PinIcon class="rotate-45  group-hover:fill-secondary -translate-x-1" size={14} />
				<span>{milestone.name}</span>
			</a>
			<span class="text-base-content/70 text-xs font-semibold col-span-2">
				{formatDatetime(milestone.timestamp)}
			</span>
		{/each}
	</div>

	<div class="grid grid-cols-3 gap-y-1 gap-x-2 items-center">
		{#each milestonesAfter as milestone (milestone.id)}
			<span class="text-base-content/70 text-xs font-semibold col-span-2 text-right">
				{formatDatetime(milestone.timestamp)}
			</span>
			<a
				class="badge badge-secondary badge-outline group hover:bg-secondary/10 ml-auto"
				href={$urlParam.with({ cursor: milestone.time.toJSON() })}
			>
				<PinIcon class="rotate-45  group-hover:fill-secondary -translate-x-1" size={14} />
				<span>{milestone.name}</span>
			</a>
		{/each}
	</div>
</div>

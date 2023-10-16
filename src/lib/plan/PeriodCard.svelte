<script lang="ts">
	import dayjs from 'dayjs'
	import { Period, Subscribe } from '@prisma/client'
	import { formatRangeHour } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'

	export let period: Period & { subscribes: Subscribe[] }
	export let origin: dayjs.Dayjs
	export let hourHeight: number
	export let headerHeight: number
	export let scale: number

	$: msHeight = (hourHeight * (scale / 24)) / (1000 * 60 * 60)
	$: top = -origin.diff(period.start) * msHeight + headerHeight
	$: height = dayjs(period.end).diff(period.start) * msHeight
</script>

<div
	id={period.id}
	role="button"
	tabindex="0"
	on:click
	on:keyup
	class="
		absolute left-2 right-0
		bg-base-300/50
		border rounded-md p-0 text-sm
		hover:z-10
		hover:outline outline-1 outline-secondary
		overflow-hidden shadow min-h-[30px]
	"
	style:top="{top}px"
	style:height="{height}px"
>
	<Progress {period} class="justify-between" badgeClass="mr-1" progressClass="bg-red-400">
		<span slot="before-badge" class="text-xs font-semibold ml-1">{formatRangeHour(period)}</span>
	</Progress>
</div>

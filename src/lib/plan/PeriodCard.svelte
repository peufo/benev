<script lang="ts">
	import dayjs from 'dayjs'
	import { Period, Subscribe } from '@prisma/client'
	import { formatRangeHour } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'

	export let period: Period & { subscribes: Subscribe[] }
	export let origin: dayjs.Dayjs
	export let hourHeight: number

	$: msHeight = hourHeight / (1000 * 60 * 60)
	$: top = -origin.diff(period.start) * msHeight
	$: height = dayjs(period.end).diff(period.start) * msHeight
</script>

<div
	class="
		absolute left-2 right-0
		bg-base-200 border rounded-md p-2 text-sm
		hover:z-10 text-center
	"
	style:top="{top}px"
	style:height="{height}px"
>
	<span class="text-xs font-semibold">{formatRangeHour(period)}</span>
	<Progress {period} />
</div>

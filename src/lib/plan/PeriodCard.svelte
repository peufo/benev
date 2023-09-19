<script lang="ts">
	import dayjs from 'dayjs'
	import { Period, Subscribe } from '@prisma/client'
	import { formatRangeHour } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import { eventPath } from '$lib/store'

	export let period: Period & { subscribes: Subscribe[] }
	export let origin: dayjs.Dayjs
	export let hourHeight: number
	export let headerHeight: number
	export let scale: number

	$: msHeight = (hourHeight * (scale / 24)) / (1000 * 60 * 60)
	$: top = -origin.diff(period.start) * msHeight + headerHeight
	$: height = dayjs(period.end).diff(period.start) * msHeight
</script>

<a
	id={period.id}
	href="{$eventPath}/teams/{period.teamId}/{period.id}"
	class="
		absolute left-2 right-0
		bg-base-200 border rounded-md p-2 text-sm
		hover:z-10
		hover:outline outline-1 outline-primary
	"
	style:top="{top}px"
	style:height="{height}px"
>
	<span class="text-xs font-semibold">{formatRangeHour(period)}</span>
	<Progress {period} />
</a>

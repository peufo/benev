<script lang="ts">
	import { formatRangeHour } from '$lib/formatRange'
	import { Period, Subscribe } from '@prisma/client'
	import dayjs from 'dayjs'

	export let period: Period & { subscribes: Subscribe[] }
	export let origin: dayjs.Dayjs
	export let hourHeight: number // houre

	$: msHeight = hourHeight / (1000 * 60 * 60)
	$: top = -origin.diff(period.start) * msHeight
	$: height = dayjs(period.end).diff(period.start) * msHeight
	$: console.log(height)
</script>

<div
	class="
		absolute left-2 right-0
		bg-base-200 border rounded-md p-2 text-sm
	"
	style:top="{top}px"
	style:height="{height}px"
>
	{formatRangeHour(period)}

	{period.subscribes.length} / {period.maxSubscribe}
</div>

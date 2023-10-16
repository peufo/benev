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
		bg-base-200 border rounded-md p-0 text-sm
		hover:z-10
		hover:outline outline-1 outline-primary
		overflow-hidden shadow min-h-[30px]
	"
	style:top="{top}px"
	style:height="{height}px"
>
	<Progress {period} class="justify-between" badgeClass="mr-1" progressClass="bg-red-400">
		<span slot="before-badge" class="text-xs font-semibold ml-1">{formatRangeHour(period)}</span>
	</Progress>
</a>

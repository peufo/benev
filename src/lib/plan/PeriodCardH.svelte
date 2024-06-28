<script lang="ts">
	import dayjs from 'dayjs'
	import { urlParam } from 'fuma'
	import type { PeriodWithSubscribesUserName } from './types'
	import DragButton from './DragButton.svelte'
	import PeriodCardContent from './PeriodCardContent.svelte'
	import { time } from './utils'
	import { updatePeriod } from './updatePeriod'
	import { magnet } from './magnet'

	export let period: PeriodWithSubscribesUserName
	export let hourSize: number
	export let origin: dayjs.Dayjs

	let deltaStartMs = 0
	let deltaEndMs = 0

	$: msSize = time(hourSize).to('hour')
	$: left = msSize * (-origin.diff(period.start) + $magnet(deltaStartMs))
	$: width =
		msSize * (dayjs(period.end).diff(period.start) - $magnet(deltaStartMs) + $magnet(deltaEndMs))

	async function handleGrabDone() {
		const start = new Date(period.start.getTime() + $magnet(deltaStartMs))
		const end = new Date(period.end.getTime() + $magnet(deltaEndMs))
		await updatePeriod({ ...period, start, end })
		period = { ...period, start, end }
		deltaStartMs = 0
		deltaEndMs = 0
	}
</script>

<div class="w-0">
	<div
		id={period.id}
		class="
			group relative
			bg-base-200/50
			border rounded-md p-0 text-sm
			hover:z-10
			hover:outline outline-1 outline-secondary
			overflow-visible shadow min-h-14 h-full
		"
		class:outline={$urlParam.hasValue('form_period', period.id)}
		style:transform="translateX({left}px)"
		style:width="{width}px"
	>
		<DragButton
			class="top-1/2"
			orientation="horizontal"
			on:done={handleGrabDone}
			on:move={({ detail: delta }) => {
				deltaStartMs = delta.x / msSize
			}}
		/>
		<DragButton
			class="left-full top-1/2"
			orientation="horizontal"
			on:done={handleGrabDone}
			on:move={({ detail: delta }) => {
				deltaEndMs = delta.x / msSize
			}}
		/>
		<DragButton
			class="left-1/2 top-full"
			on:done={handleGrabDone}
			on:move={({ detail: delta }) => {
				deltaStartMs = delta.x / msSize
				deltaEndMs = delta.x / msSize
			}}
		/>

		<PeriodCardContent {period} {deltaStartMs} {deltaEndMs} />
	</div>
</div>

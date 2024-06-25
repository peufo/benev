<script lang="ts">
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr-ch'
	import type { Period, Subscribe } from '@prisma/client'
	import { formatRangeHour } from '$lib/formatRange'
	import Progress from '$lib/Progress.svelte'
	import DragButton from './DragButton.svelte'
	import { urlParam } from 'fuma'

	import { roundMinute } from './utils'
	import { updatePeriod } from './updatePeriod'

	export let period: Period & { subscribes: Subscribe[] }
	export let origin: dayjs.Dayjs
	export let msSize: number

	let deltaStart = 0
	let deltaEnd = 0

	$: top = -origin.diff(period.start) * msSize + deltaStart
	$: height = dayjs(period.end).diff(period.start) * msSize - deltaStart + deltaEnd

	async function handleGrabDone() {
		const start = new Date(period.start.getTime() + roundMinute(deltaStart / msSize))
		const end = new Date(period.end.getTime() + roundMinute(deltaEnd / msSize))
		await updatePeriod({ ...period, start, end })
		period = { ...period, start, end }
		deltaStart = 0
		deltaEnd = 0
	}
</script>

<div
	id={period.id}
	class="
		group
		absolute left-0 right-0
		bg-base-200/50
		border rounded-md p-0 text-sm
		hover:z-10
		hover:outline outline-1 outline-secondary
		overflow-visible shadow min-h-[30px]
	"
	class:outline={$urlParam.hasValue('form_period', period.id)}
	style:top="{top}px"
	style:height="{height}px"
>
	<DragButton
		class="left-1/2"
		orientation="horizontal"
		on:done={handleGrabDone}
		on:move={({ detail: delta }) => {
			deltaStart = delta.y
		}}
	/>
	<DragButton
		class="left-1/2 top-full"
		orientation="horizontal"
		on:done={handleGrabDone}
		on:move={({ detail: delta }) => {
			deltaEnd = delta.y
		}}
	/>
	<DragButton
		class="left-full top-1/2"
		on:done={handleGrabDone}
		on:move={({ detail: delta }) => {
			deltaStart = delta.y
			deltaEnd = delta.y
		}}
	/>

	<Progress {period} class="justify-between" badgeClass="mr-1" progressClass="bg-red-400">
		<span slot="before-badge" class="text-xs font-semibold ml-1">
			{formatRangeHour({
				start: period.start.getTime() + roundMinute(deltaStart / msSize),
				end: period.end.getTime() + roundMinute(deltaEnd / msSize),
			})}
		</span>
	</Progress>

	<a
		href={$urlParam.with({ form_period: period.id })}
		class="absolute inset-0"
		data-sveltekit-noscroll
		data-sveltekit-preload-data="off"
		data-sveltekit-replacestate
	>
		{' '}
	</a>
</div>

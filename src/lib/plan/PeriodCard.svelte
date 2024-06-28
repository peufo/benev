<script lang="ts">
	import dayjs from 'dayjs'
	import { urlParam } from 'fuma'
	import type { PeriodWithSubscribesUserName } from './types'
	import { PeriodCardContent } from './cardContent'
	import { time } from './utils'
	import { updatePeriod } from './updatePeriod'
	import { magnet } from './magnet'
	import DragButton from './DragButton.svelte'

	export let period: PeriodWithSubscribesUserName
	export let hourSize: number
	export let origin: dayjs.Dayjs
	export let axis: 'x' | 'y'
	export let drags: {
		class?: string
		axis?: 'x' | 'y' | 'any'
		moveStart?: boolean
		moveEnd?: boolean
	}[]

	let deltaStartMs = 0
	let deltaEndMs = 0

	$: msSize = time(hourSize).to('hour')
	$: startPx = msSize * (-origin.diff(period.start) + $magnet(deltaStartMs))
	$: sizePx =
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

<div class:w-0={axis === 'x'} class:h-0={axis === 'y'}>
	<div
		id={period.id}
		class:h-full={axis === 'x'}
		class:w-full={axis === 'y'}
		style={axis === 'x'
			? `left: ${startPx}px; width: ${sizePx}px`
			: `top: ${startPx}px; height: ${sizePx}px`}
		class="
			group relative
			bg-base-200/50
			rounded-md p-0 text-sm
			hover:z-10
			outline outline-1 border-[1px] border-base-300
			overflow-visible min-h-[30px]
			{$urlParam.hasValue('form_period', period.id)
			? 'outline-secondary border-secondary z-20'
			: 'outline-base-300'}
		"
	>
		{#each drags as drag}
			<DragButton
				class={drag.class || ''}
				axis={drag.axis}
				on:done={handleGrabDone}
				on:move={({ detail: delta }) => {
					if (drag.moveStart) deltaStartMs = delta[axis] / msSize
					if (drag.moveEnd) deltaEndMs = delta[axis] / msSize
				}}
			/>
		{/each}

		<PeriodCardContent {period} {deltaStartMs} {deltaEndMs} />
	</div>
</div>

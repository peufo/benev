<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	import { daytz } from '$lib/dayjs'
	import { urlParam } from '$lib/fuma'
	import type { PeriodWithMembers, Plan } from './types'
	import { PeriodCardContent } from './cardContent'
	import { time } from './utils'
	import { updatePeriod } from './updatePeriod'
	import { magnet } from './magnet'
	import DragButton from './DragButton.svelte'

	interface Props {
		period: PeriodWithMembers;
		plan: Plan;
		drags: {
		class?: string
		axis?: 'x' | 'y' | 'any'
		moveStart?: boolean
		moveEnd?: boolean
	}[];
	}

	let { period, plan, drags }: Props = $props();

	let deltaStartMs = $state(0)
	let deltaEndMs = $state(0)

	let msSize = $derived(time(plan.hourSize).to('hour'))
	let startPx = $derived(msSize * (-plan.start.diff(daytz(period.start)) + $magnet(deltaStartMs)))
	let sizePx =
		$derived(msSize *
		(daytz(period.end).diff(daytz(period.start)) - $magnet(deltaStartMs) + $magnet(deltaEndMs)))

	const dispatch = createEventDispatcher<{ update: PeriodWithMembers }>()

	async function handleGrabDone() {
		const start = new Date(period.start.getTime() + $magnet(deltaStartMs))
		const end = new Date(period.end.getTime() + $magnet(deltaEndMs))
		// period = { ...period, start, end }
		await updatePeriod({ ...period, start, end })
		dispatch('update', { ...period, start, end })
		deltaStartMs = 0
		deltaEndMs = 0
	}
</script>

<div class={plan.axis === 'x' ? 'w-0' : 'h-0'}>
	<div
		id={period.id}
		class:h-full={plan.axis === 'x'}
		class:w-full={plan.axis === 'y'}
		style={plan.axis === 'x'
			? `left: ${startPx}px; width: ${sizePx}px`
			: `top: ${startPx}px; height: ${sizePx}px`}
		class="
			group relative z-10 hover:z-20
			bg-base-200
			rounded-md p-0 text-sm
			outline outline-1 border-[1px] border-base-300
			overflow-visible min-h-[30px]
			{$urlParam.hasValue('form_period', period.id)
			? 'outline-secondary border-secondary z-20'
			: 'outline-base-300'}
		"
	>
		{#each drags as drag, i (i)}
			<DragButton
				class={drag.class || ''}
				axis={drag.axis}
				on:done={handleGrabDone}
				on:move={({ detail: delta }) => {
					if (drag.moveStart) deltaStartMs = delta[plan.axis] / msSize
					if (drag.moveEnd) deltaEndMs = delta[plan.axis] / msSize
				}}
			/>
		{/each}

		<PeriodCardContent {period} {deltaStartMs} {deltaEndMs} />
	</div>
</div>
